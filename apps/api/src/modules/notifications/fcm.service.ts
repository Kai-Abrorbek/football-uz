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

  async sendToDevice(token: string, title: string, body: string, data?: any) {
    try {
      const message = {
        notification: {
          title,
          body,
        },
        data: data || {},
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

  async sendToMultipleDevices(
    tokens: string[],
    title: string,
    body: string,
    data?: any,
  ) {
    try {
      // 빈 배열 체크
      if (!tokens || tokens.length === 0) {
        this.logger.warn('No FCM tokens provided, skipping notification');
        return {
          successCount: 0,
          failureCount: 0,
          responses: [],
        };
      }

      // 유효하지 않은 토큰 필터링
      const validTokens = tokens.filter(
        (token) => token && token.trim().length > 0,
      );

      if (validTokens.length === 0) {
        this.logger.warn('No valid FCM tokens after filtering');
        return {
          successCount: 0,
          failureCount: 0,
          responses: [],
        };
      }

      console.log('FCM 전송 시도:', { tokens: validTokens.length, title });

      const message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        tokens: validTokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      console.log('성공:', response.successCount);
      console.log('실패:', response.failureCount);

      if (response.failureCount > 0) {
        const invalidTokens: string[] = [];

        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            this.logger.error(`토큰 ${idx} 실패:`, resp.error);

            // 유효하지 않은 토큰이면 삭제 목록에 추가
            if (
              resp.error?.code === 'messaging/invalid-argument' ||
              resp.error?.code === 'messaging/registration-token-not-registered'
            ) {
              invalidTokens.push(validTokens[idx]);
            }
          }
        });

        // 유효하지 않은 토큰 DB에서 삭제
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

  async sendToTopic(topic: string, title: string, body: string, data?: any) {
    try {
      const message = {
        notification: {
          title,
          body,
        },
        data: data || {},
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
