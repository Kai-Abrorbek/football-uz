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
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
        this.logger.log('Firebase Admin initialized');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase', error);
    }
  }

  // 1. 단일 기기 전송
  async sendToDevice(token: string, title: string, body: string, data?: any) {
    try {
      const message: admin.messaging.Message = {
        // ⚽️ 1. OS가 직접 읽는 알림 영역 (이게 있어야 앱 꺼져도 옴)
        notification: {
          title: String(title),
          body: String(body),
        },
        // ⚽️ 2. 앱 내부 로직용 데이터
        data: {
          ...this.stringifyData(data),
          isServerNotification: 'true',
        },

        // ⚽️ 3. 안드로이드 전용 설정 (중요!)
        android: {
          priority: 'high', // 'high'로 해야 꺼져 있을 때도 즉시 전송됨
          notification: {
            sound: 'default',
            channelId: 'default', // 프론트에서 만든 채널ID와 일치해야 함
            clickAction: 'TOP_LEVEL_NAVIGATOR',
          },
        },
        // ⚽️ 4. iOS 전용 설정 (혹시 모르니)
        apns: {
          payload: {
            aps: {
              contentAvailable: true,
              sound: 'default',
            },
          },
        },
        token,
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Notification sent successfully: ${response}`);
      return response;
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
  ): Promise<admin.messaging.BatchResponse | void> {
    try {
      const validTokens = tokens.filter(
        (t) => t && t.trim().length > 0 && !t.startsWith('ExponentPushToken'),
      );
      if (validTokens.length === 0) return;

      // ⚽️ 핵심: MulticastMessage 타입에 맞춰 설정 추가
      const message: admin.messaging.MulticastMessage = {
        tokens: validTokens,
        notification: {
          title: String(title),
          body: String(body),
        },
        data: {
          title: String(title),
          body: String(body),
          ...this.stringifyData(data),
          isServerNotification: 'true',
        },
        // 🚀 안드로이드: 앱이 꺼져있을 때(Killed state) 즉시 깨우기 위한 설정
        android: {
          priority: 'high', // 'high'여야만 꺼진 앱을 깨움
          notification: {
            sound: 'default',
            channelId: 'default', // 프론트 채널ID와 맞춰야 함
            clickAction: 'TOP_LEVEL_NAVIGATOR',
          },
        },
        // 🍏 iOS: 백그라운드 데이터 수신 허용
        apns: {
          payload: {
            aps: {
              contentAvailable: true,
              sound: 'default',
            },
          },
        },
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      // 실패한 토큰 삭제 로직 (기존 유지)
      if (response.failureCount > 0) {
        const invalidTokens = validTokens.filter(
          (_, i) => !response.responses[i].success,
        );

        this.logger.warn(`Cleaning up ${invalidTokens.length} invalid tokens`);

        await this.userModel.updateMany(
          { fcmTokens: { $in: invalidTokens } },
          { $pull: { fcmTokens: { $in: invalidTokens } } },
        );
      }

      this.logger.log(
        `Successfully sent ${response.successCount} notifications`,
      );
      return response;
    } catch (error) {
      this.logger.error('Failed to send notifications', error);
    }
  }

  // 🚨 3. 토픽 전송 (notification 삭제)
  async sendToTopic(topic: string, title: string, body: string, data?: any) {
    try {
      const message: admin.messaging.Message = {
        // ⚽️ 1. OS가 직접 읽는 알림 영역 (이게 있어야 앱 꺼져도 옴)
        notification: {
          title: String(title),
          body: String(body),
        },
        // ⚽️ 2. 앱 내부 로직용 데이터
        data: {
          ...this.stringifyData(data),
          isServerNotification: 'true',
        },

        // ⚽️ 3. 안드로이드 전용 설정 (중요!)
        android: {
          priority: 'high', // 'high'로 해야 꺼져 있을 때도 즉시 전송됨
          notification: {
            sound: 'default',
            channelId: 'default', // 프론트에서 만든 채널ID와 일치해야 함
            clickAction: 'TOP_LEVEL_NAVIGATOR',
          },
        },
        // ⚽️ 4. iOS 전용 설정 (혹시 모르니)
        apns: {
          payload: {
            aps: {
              contentAvailable: true,
              sound: 'default',
            },
          },
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
