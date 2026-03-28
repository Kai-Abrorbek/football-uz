import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as admin from 'firebase-admin';
import { User, UserDocument } from '../../schemas';
import { Model } from 'mongoose';

@Injectable()
export class FcmService implements OnModuleInit {
  private readonly logger = new Logger(FcmService.name);

  constructor(
    private config: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  onModuleInit() {
    const projectId = this.config.get('FIREBASE_PROJECT_ID');
    const clientEmail = this.config.get('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.config
      .get('FIREBASE_PRIVATE_KEY')
      ?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.error('Firebase credentials not configured');
      return;
    }

    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      this.logger.log('Firebase Admin initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase', error);
    }
  }

  // 1. 단일 기기 전송
  async sendToDevice(token: string, title: string, body: string, data?: any) {
    try {
      const message = {
        notification: { title: String(title), body: String(body) }, // ⚽️ OS 알림용
        data: {
          title: String(title),
          body: String(body),
          ...this.stringifyData(data),
        }, // 앱 내부 로직용
        token,
      };
      return await admin.messaging().send(message);
    } catch (error) {
      this.logger.error('Failed to send notification', error);
    }
  }

  // 2. 다중 기기 전송
  async sendToMultipleDevices(
    tokens: string[],
    title: string,
    body: string,
    data?: any,
  ) {
    try {
      const validTokens = tokens.filter(
        (t) => t && t.trim().length > 0 && !t.startsWith('ExponentPushToken'),
      );
      if (validTokens.length === 0) return;

      const message = {
        notification: { title: String(title), body: String(body) }, // ⚽️ OS 알림용
        data: {
          title: String(title),
          body: String(body),
          ...this.stringifyData(data),
        },
        tokens: validTokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      // 실패한 토큰 삭제 로직 (기존 유지)
      if (response.failureCount > 0) {
        const invalidTokens = validTokens.filter(
          (_, i) => !response.responses[i].success,
        );
        await this.userModel.updateMany(
          { fcmTokens: { $in: invalidTokens } },
          { $pull: { fcmTokens: { $in: invalidTokens } } },
        );
      }
      return response;
    } catch (error) {
      this.logger.error('Failed to send notifications', error);
    }
  }

  // 🚨 3. 토픽 전송 (notification 삭제)
  async sendToTopic(topic: string, title: string, body: string, data?: any) {
    try {
      const message = {
        notification: { title: String(title), body: String(body) }, // ⚽️ OS 알림용
        data: {
          title: String(title),
          body: String(body),
          ...this.stringifyData(data),
        },
        topic,
      };
      return await admin.messaging().send(message);
    } catch (error) {
      this.logger.error('Failed to send topic notification', error);
    }
  }

  // 💡 FCM data 필드는 모든 값을 string으로 보내야 안전함
  private stringifyData(data?: any) {
    const result: any = {};
    if (!data) return result;
    Object.keys(data).forEach((key) => {
      result[key] = String(data[key]);
    });
    return result;
  }
}
