import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match, MatchDocument } from '../../../schemas/match.schema';
import { NotificationsService } from '../notifications.service';

@Injectable()
export class NotificationScheduler {
  private readonly logger = new Logger(NotificationScheduler.name);

  constructor(
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
    private notificationsService: NotificationsService,
  ) {}

  // 경기 시작 30분 전 알림 - 매분 체크
  @Cron('* * * * *')
  async checkUpcomingMatches() {
    const now = new Date();
    const in30Min = new Date(now.getTime() + 30 * 60 * 1000);

    const upcomingMatches = await this.matchModel.find({
      'status.short': 'NS',
      date: {
        $gte: now,
        $lte: in30Min,
      },
    });

    for (const match of upcomingMatches) {
      this.logger.log(
        `Sending match start notification for ${match.homeTeam.name} vs ${match.awayTeam.name}`,
      );

      await this.notificationsService.sendMatchStartNotification(
        match.apiFootballId,
        match.homeTeam.name!,
        match.awayTeam.name!,
      );
    }
  }

  // 골 알림 - 5분마다 라이브 경기 체크
  @Cron('*/5 * * * *')
  async checkLiveMatchGoals() {
    // 라이브 경기 조회
    const liveMatches = await this.matchModel.find({
      'status.short': { $in: ['1H', '2H', 'ET'] },
    });

    for (const match of liveMatches) {
      // events에서 최근 5분 내 골 체크
      const recentGoals = match.events.filter((event) => {
        if (event.type !== 'Goal') return false;

        const now = new Date();
        const eventTime = event.time.elapsed || 0;
        const matchStart = match.date;
        const eventDate = new Date(
          matchStart.getTime() + eventTime * 60 * 1000,
        );

        return now.getTime() - eventDate.getTime() < 5 * 60 * 1000;
      });

      if (recentGoals.length > 0) {
        const lastGoal = recentGoals[recentGoals.length - 1];
        this.logger.log(
          `Goal scored: ${lastGoal.player?.name} - ${match.homeTeam.name} vs ${match.awayTeam.name}`,
        );

        // 골 알림 전송 (나중에 구현)
      }
    }
  }

  // 경기 종료 알림 - 5분마다 체크
  @Cron('*/5 * * * *')
  async checkFinishedMatches() {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

    const recentlyFinished = await this.matchModel.find({
      'status.short': 'FT',
      updatedAt: { $gte: fiveMinAgo },
    });

    for (const match of recentlyFinished) {
      this.logger.log(
        `Match finished: ${match.homeTeam.name} ${match.goals?.home}-${match.goals?.away} ${match.awayTeam.name}`,
      );

      // 종료 알림 전송 (나중에 구현)
    }
  }
}
