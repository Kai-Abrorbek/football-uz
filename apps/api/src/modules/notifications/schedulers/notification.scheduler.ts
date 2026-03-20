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
      notifiedEvents: { $not: { $elemMatch: { $eq: 'matchStart' } } }, // ← 추가
    });

    for (const match of upcomingMatches) {
      this.logger.log(
        `Sending match start notification for ${match.homeTeam.name} vs ${match.awayTeam.name}`,
      );

      await this.notificationsService.sendMatchStartNotification(
        match._id.toString(),
        match.homeTeam.name!,
        match.awayTeam.name!,
      );

      // 알림 보낸 경기 기록 ← 추가
      await this.matchModel.findByIdAndUpdate(match._id, {
        $addToSet: { notifiedEvents: 'matchStart' },
      });
    }
  }

  // 골 알림 - 1분마다 라이브 경기 체크
  @Cron('*/1 * * * *')
  async checkLiveMatchGoals() {
    const liveMatches = await this.matchModel.find({
      'status.short': { $in: ['1H', '2H', 'ET'] },
    });

    for (const match of liveMatches) {
      const recentGoals = match.events.filter((event) => {
        if (event.type !== 'Goal') return false;
        const now = new Date();
        const eventTime = event.time.elapsed || 0;
        const matchStart = match.date;
        const eventDate = new Date(
          matchStart.getTime() + eventTime * 60 * 1000,
        );
        return now.getTime() - eventDate.getTime() < 1 * 60 * 1000;
      });

      for (const goal of recentGoals) {
        const goalKey = `${match._id}_${goal.time.elapsed}_${goal.player?.id}`;

        // 이미 알림 보낸 골이면 스킵
        if (match.notifiedEvents?.includes(goalKey)) continue;

        this.logger.log(
          `Goal scored: ${goal.player?.name} - ${match.homeTeam.name} vs ${match.awayTeam.name}`,
        );

        await this.notificationsService.sendGoalNotification(
          match._id.toString(),
          match.homeTeam.name!,
          match.awayTeam.name!,
          goal.player?.name ?? 'Unknown',
          match.goals?.home ?? 0,
          match.goals?.away ?? 0,
        );

        // 알림 보낸 골 기록
        await this.matchModel.findByIdAndUpdate(match._id, {
          $addToSet: { notifiedEvents: goalKey },
        });
      }
    }
  }

  // 경기 종료 알림 - 5분마다 체크
  @Cron('*/1 * * * *')
  async checkFinishedMatches() {
    const fiveMinAgo = new Date(Date.now() - 2 * 60 * 1000);

    const recentlyFinished = await this.matchModel.find({
      'status.short': 'FT',
      updatedAt: { $gte: fiveMinAgo },
      notifiedEvents: { $not: { $elemMatch: { $eq: 'matchEnd' } } }, // 이미 알림 보낸 경기 제외
    });

    for (const match of recentlyFinished) {
      this.logger.log(
        `Match finished: ${match.homeTeam.name} ${match.goals?.home}-${match.goals?.away} ${match.awayTeam.name}`,
      );

      await this.notificationsService.sendMatchEndNotification(
        match._id.toString(),
        match.homeTeam.name!,
        match.awayTeam.name!,
        match.goals?.home ?? 0,
        match.goals?.away ?? 0,
      );

      // 종료 알림 보낸 경기 기록
      await this.matchModel.findByIdAndUpdate(match._id, {
        $addToSet: { notifiedEvents: 'matchEnd' },
      });
    }
  }
}
