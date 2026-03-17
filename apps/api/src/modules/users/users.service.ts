import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateFavoritesDto } from './dto/update-favorites.dto';
import { UpdateNotificationSettingsDto } from '../notifications/dto/update-notification-settings.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getProfile(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다');
    }
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    if (dto.username) {
      user.username = dto.username;
    }

    if (dto.avatar) {
      user.avatar = dto.avatar;
    }

    if (dto.language) {
      user.language = dto.language;
    }

    await user.save();

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      language: user.language,
      avatar: user.avatar,
    };
  }

  async findById(userId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      language: user.language,
      avatar: user.avatar,
      notificationSettings: user.notificationSettings || {
        // 추가
        matchStart: false,
        goals: false,
        matchEnd: false,
        news: false,
        predictions: false,
      },
    };
  }

  async updateFavorites(
    userId: string,
    dto: UpdateFavoritesDto,
  ): Promise<UserDocument> {
    const fieldMap = {
      teams: 'favoriteTeams',
      players: 'favoritePlayers',
      leagues: 'favoriteLeagues',
    };

    const field = fieldMap[dto.type];
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: { [field]: dto.ids } },
        { returnDocument: 'after' },
      )
      .select('-password');

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다');
    }

    return user;
  }

  async addFavorite(
    userId: string,
    type: string,
    id: number,
  ): Promise<UserDocument> {
    const fieldMap = {
      teams: 'favoriteTeams',
      players: 'favoritePlayers',
      leagues: 'favoriteLeagues',
    };

    const field = fieldMap[type];
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $addToSet: { [field]: id } },
        { returnDocument: 'after' },
      )
      .select('-password');

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다');
    }

    return user;
  }

  async removeFavorite(
    userId: string,
    type: string,
    id: number,
  ): Promise<UserDocument> {
    const fieldMap = {
      teams: 'favoriteTeams',
      players: 'favoritePlayers',
      leagues: 'favoriteLeagues',
    };

    const field = fieldMap[type];
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { [field]: id } },
        { returnDocument: 'after' },
      )
      .select('-password');

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다');
    }

    return user;
  }

  async addFcmToken(userId: string, token: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { fcmTokens: token },
    });
  }

  async removeFcmToken(userId: string, token: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { fcmTokens: token },
    });
  }

  async updateNotificationSettings(
    userId: string,
    dto: UpdateNotificationSettingsDto,
  ) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    // 기존 설정 가져오기 (없으면 기본값)
    const currentSettings = user.notificationSettings || {
      matchStart: false,
      goals: false,
      matchEnd: false,
      news: false,
      predictions: false,
    };

    // 전달된 필드만 업데이트
    user.notificationSettings = {
      matchStart:
        dto.matchStart !== undefined
          ? dto.matchStart
          : currentSettings.matchStart,
      goals: dto.goals !== undefined ? dto.goals : currentSettings.goals,
      matchEnd:
        dto.matchEnd !== undefined ? dto.matchEnd : currentSettings.matchEnd,
      news: dto.news !== undefined ? dto.news : currentSettings.news,
      predictions:
        dto.predictions !== undefined
          ? dto.predictions
          : currentSettings.predictions,
    };

    user.markModified('notificationSettings');
    await user.save();

    return user.notificationSettings;
  }

  async registerFcmToken(userId: string, token: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    if (!user.fcmTokens) {
      user.fcmTokens = [];
    }

    // 중복 체크
    if (!user.fcmTokens.includes(token)) {
      user.fcmTokens.push(token);
      await user.save();
    }

    return { message: 'FCM 토큰이 등록되었습니다' };
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async toggleFollow(
    userId: string,
    type: 'teams' | 'players' | 'leagues',
    id: number,
  ): Promise<{ following: boolean }> {
    const fieldMap = {
      teams: 'favoriteTeams',
      players: 'favoritePlayers',
      leagues: 'favoriteLeagues',
    };

    const field = fieldMap[type];
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다');

    const list = user[field] as number[];
    const isFollowing = list.includes(id);

    if (isFollowing) {
      await this.userModel.findByIdAndUpdate(userId, {
        $pull: { [field]: id },
      });
    } else {
      await this.userModel.findByIdAndUpdate(userId, {
        $addToSet: { [field]: id },
      });
    }

    return { following: !isFollowing };
  }

  async getFollowing(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('favoriteTeams favoritePlayers favoriteLeagues');
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다');

    return {
      teams: user.favoriteTeams,
      players: user.favoritePlayers,
      leagues: user.favoriteLeagues,
    };
  }

  async getFollowingTeams(userId: string) {
    const user = await this.userModel.findById(userId).select('favoriteTeams');
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다');
    return user.favoriteTeams;
  }

  async getFollowingPlayers(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('favoritePlayers');
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다');
    return user.favoritePlayers;
  }

  async getFollowingLeagues(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('favoriteLeagues');
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다');
    return user.favoriteLeagues;
  }
}
