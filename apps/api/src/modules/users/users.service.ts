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
import { UpdateSettingsDto } from './dto/update-settings.dto';

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
      language: user.language,
      avatar: user.avatar,
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

  async updateNotificationSettings(
    userId: string,
    dto: UpdateSettingsDto,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: { notificationSettings: dto } },
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
}
