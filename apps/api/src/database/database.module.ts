import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        // 연결 옵션
        autoIndex: true, // 개발 환경에서만 true, 프로덕션은 false
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 30000,
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {
  constructor(@InjectConnection() private readonly connection: Connection) {
    if (connection.readyState === 1) {
      console.log(
        `MongoDB is connected into ${process.env.NODE_ENV === 'production' ? 'production' : 'development'} DB`,
      );
    } else {
      console.log('DB is not connected');
    }
  }
}
