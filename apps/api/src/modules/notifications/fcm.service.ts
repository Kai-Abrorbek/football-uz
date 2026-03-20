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
        data: {
          title: String(title),
          body: String(body),
          ...(data || {}),
        },
        token,
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Notification sent: ${response}`);
      return response;
    } catch (error) {
      this.logger.error('Failed to send notification', error);
      throw error;
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
      if (!tokens || tokens.length === 0) {
        this.logger.warn('No FCM tokens provided, skipping notification');
        return { successCount: 0, failureCount: 0, responses: [] };
      }

      const validTokens = tokens.filter(
        (token) =>
          token &&
          token.trim().length > 0 &&
          !token.startsWith('ExponentPushToken'),
      );

      if (validTokens.length === 0) {
        this.logger.warn('No valid FCM tokens after filtering');
        return { successCount: 0, failureCount: 0, responses: [] };
      }

      const message = {
        data: {
          title: String(title),
          body: String(body),
          ...(data || {}),
        },
        tokens: validTokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      if (response.failureCount > 0) {
        const invalidTokens: string[] = [];

        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            this.logger.error(`토큰 ${idx} 실패:`, resp.error);

            if (
              resp.error?.code === 'messaging/invalid-argument' ||
              resp.error?.code ===
                'messaging/registration-token-not-registered' ||
              resp.error?.code === 'messaging/invalid-registration-token'
            ) {
              invalidTokens.push(validTokens[idx]);
            }
          }
        });

        if (invalidTokens.length > 0) {
          await this.userModel.updateMany(
            { fcmTokens: { $in: invalidTokens } },
            { $pull: { fcmTokens: { $in: invalidTokens } } },
          );
          this.logger.log(
            `삭제된 유효하지 않은 토큰: ${invalidTokens.length}개`,
          );
        }
      }

      this.logger.log(
        `Sent ${response.successCount} notifications, ${response.failureCount} failed`,
      );
      return response;
    } catch (error) {
      this.logger.error('Failed to send notifications', error);
      throw error;
    }
  }

  // 🚨 3. 토픽 전송 (notification 삭제)
  async sendToTopic(topic: string, title: string, body: string, data?: any) {
    try {
      const message = {
        data: {
          title: String(title),
          body: String(body),
          ...(data || {}),
        },
        topic,
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Topic notification sent: ${response}`);
      return response;
    } catch (error) {
      this.logger.error('Failed to send topic notification', error);
      throw error;
    }
  }
}
