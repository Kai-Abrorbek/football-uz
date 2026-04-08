// notification-scheduler.service.ts
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

  // 1. 경기 시작 전 알림 (매분 체크)
  @Cron('* * * * *')
  async checkUpcomingMatches() {
    const now = new Date();
    const in30Min = new Date(now.getTime() + 30 * 60 * 1000);

    const upcomingMatches = await this.matchModel.find({
      'status.short': 'NS',
      date: { $gte: now, $lte: in30Min },
      notifiedEvents: { $not: { $elemMatch: { $eq: 'matchStart' } } },
    });

    for (const match of upcomingMatches) {
      this.logger.log(
        `Match starting soon: ${match.homeTeam.name} vs ${match.awayTeam.name}`,
      );

      await this.notificationsService.sendMatchStartNotification(
        match._id.toString(),
        match.homeTeam.name!,
        match.awayTeam.name!,
        match.homeTeam.logo, // ⚽️ 경기 로고로 홈팀 로고 전달
      );

      await this.matchModel.findByIdAndUpdate(match._id, {
        $addToSet: { notifiedEvents: 'matchStart' },
      });
    }
  }

  // 2. 골 알림 (라이브 경기 체크)
  @Cron('*/1 * * * *')
  async checkLiveMatchGoals() {
    const liveMatches = await this.matchModel.find({
      'status.short': { $in: ['1H', '2H', 'ET'] },
    });

    for (const match of liveMatches) {
      const recentGoals = match.events.filter((event) => {
        if (event.type !== 'Goal') return false;

        // 현재 시간 기준 2분 이내 발생한 골만 필터링 (안전하게 2분)
        const now = new Date();
        const eventTime = event.time.elapsed || 0;
        const eventDate = new Date(
          match.date.getTime() + eventTime * 60 * 1000,
        );
        return now.getTime() - eventDate.getTime() < 2 * 60 * 1000;
      });

      for (const goal of recentGoals) {
        const goalKey = `goal_${match._id}_${goal.time.elapsed}_${goal.player?.id}`;

        if (match.notifiedEvents?.includes(goalKey)) continue;

        // ⚽️ 어느 팀이 골을 넣었는지 판단해서 로고 선택
        const scoringTeamLogo =
          goal.team?.id === match.homeTeam.id
            ? match.homeTeam.logo
            : match.awayTeam.logo;

        this.logger.log(
          `Goal notification: ${goal.player?.name} (${goal.team?.name})`,
        );

        await this.notificationsService.sendGoalNotification(
          match._id.toString(),
          match.homeTeam.name!,
          match.awayTeam.name!,
          goal.player?.name ?? 'Unknown',
          match.goals?.home ?? 0,
          match.goals?.away ?? 0,
          scoringTeamLogo || '', // ⚽️ 득점팀 로고 전달
        );

        await this.matchModel.findByIdAndUpdate(match._id, {
          $addToSet: { notifiedEvents: goalKey },
        });
      }
    }
  }

  // 3. 경기 종료 알림
  @Cron('*/1 * * * *')
  async checkFinishedMatches() {
    const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000);

    const recentlyFinished = await this.matchModel.find({
      'status.short': 'FT',
      updatedAt: { $gte: twoMinAgo },
      notifiedEvents: { $not: { $elemMatch: { $eq: 'matchEnd' } } },
    });

    for (const match of recentlyFinished) {
      this.logger.log(
        `Match finished: ${match.homeTeam.name} vs ${match.awayTeam.name}`,
      );

      await this.notificationsService.sendMatchEndNotification(
        match._id.toString(),
        match.homeTeam.name!,
        match.awayTeam.name!,
        match.goals?.home ?? 0,
        match.goals?.away ?? 0,
      );

      await this.matchModel.findByIdAndUpdate(match._id, {
        $addToSet: { notifiedEvents: 'matchEnd' },
      });
    }
  }
}
