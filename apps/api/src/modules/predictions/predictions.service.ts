import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Prediction,
  PredictionDocument,
} from '../../schemas/prediction.schema';
import { Match, MatchDocument } from '../../schemas/match.schema';
import { Standing, StandingDocument } from '../../schemas/standing.schema';
import { GptService } from './gpt.service';

@Injectable()
export class PredictionsService {
  constructor(
    @InjectModel(Prediction.name)
    private predictionModel: Model<PredictionDocument>,
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
    @InjectModel(Standing.name) private standingModel: Model<StandingDocument>,
    private gptService: GptService,
  ) {}

  async createPrediction(matchId: number) {
    // 이미 예측 있으면 반환
    const existing = await this.predictionModel.findOne({
      apiFootballId: matchId,
    });
    if (existing) {
      return existing;
    }

    // 경기 정보 조회
    const match = await this.matchModel.findOne({ apiFootballId: matchId });

    if (!match) {
      throw new NotFoundException('경기를 찾을 수 없습니다');
    }

    // if (match.status.short !== 'NS') {
    //   throw new BadRequestException('이미 시작했거나 종료된 경기입니다');
    // }

    // H2H 조회
    const h2h = await this.matchModel
      .find({
        $or: [
          {
            'homeTeam.id': match.homeTeam.id,
            'awayTeam.id': match.awayTeam.id,
          },
          {
            'homeTeam.id': match.awayTeam.id,
            'awayTeam.id': match.homeTeam.id,
          },
        ],
        'status.short': 'FT',
      })
      .sort({ date: -1 })
      .limit(5)
      .exec();

    // 최근 폼 (홈팀)
    const homeForm = await this.matchModel
      .find({
        $or: [
          { 'homeTeam.id': match.homeTeam.id },
          { 'awayTeam.id': match.homeTeam.id },
        ],
        'status.short': 'FT',
      })
      .sort({ date: -1 })
      .limit(5)
      .exec();

    // 최근 폼 (원정팀)
    const awayForm = await this.matchModel
      .find({
        $or: [
          { 'homeTeam.id': match.awayTeam.id },
          { 'awayTeam.id': match.awayTeam.id },
        ],
        'status.short': 'FT',
      })
      .sort({ date: -1 })
      .limit(5)
      .exec();

    // 순위 조회
    const standing = await this.standingModel.findOne({
      'league.id': match?.league?.id,
      'league.season': match?.league?.season,
    });

    let homePos = null;
    let awayPos = null;
    if (standing) {
      standing.standings.forEach((group: any) => {
        group.forEach((entry: any) => {
          if (entry.team.id === match.homeTeam.id) homePos = entry.rank;
          if (entry.team.id === match.awayTeam.id) awayPos = entry.rank;
        });
      });
    }

    // GPT 프롬프트 생성
    const prompt = this.buildPrompt(
      match,
      h2h,
      homeForm,
      awayForm,
      homePos,
      awayPos,
    );
    const gptResponse = await this.gptService.generatePrediction(prompt);

    // GPT 응답 파싱 (JSON 형식으로 요청했으므로)
    const parsed = this.parseGptResponse(gptResponse);

    // 예측 저장
    const prediction = await this.predictionModel.create({
      matchId: match._id,
      apiFootballId: matchId,
      homeTeam: {
        id: match.homeTeam.id,
        name: match.homeTeam.name,
      },
      awayTeam: {
        id: match.awayTeam.id,
        name: match.awayTeam.name,
      },
      prediction: {
        winner: parsed.winner,
        homeWinProb: parsed.homeWinProb,
        drawProb: parsed.drawProb,
        awayWinProb: parsed.awayWinProb,
        predictedScore: parsed.predictedScore,
        advice: parsed.advice,
        analysis: parsed.analysis,
      },
      dataUsed: {
        h2h: h2h.length,
        homeForm: this.calculateForm(homeForm, match.homeTeam.id),
        awayForm: this.calculateForm(awayForm, match.awayTeam.id),
        homeLeaguePos: homePos,
        awayLeaguePos: awayPos,
      },
      confidence: parsed.confidence || 70,
      gptModel: 'gpt-4o-mini',
    });

    return prediction;
  }

  async findByMatch(matchId: number) {
    let prediction = await this.predictionModel.findOne({
      apiFootballId: matchId,
    });
    if (!prediction) {
      prediction = await this.createPrediction(matchId);
    }

    return prediction;
  }

  async findAll(limit: number = 20) {
    return this.predictionModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  private buildPrompt(
    match: any,
    h2h: any[],
    homeForm: any[],
    awayForm: any[],
    homePos: number | null,
    awayPos: number | null,
  ): string {
    const h2hSummary = h2h
      .map((m) => {
        const homeGoals =
          m.homeTeam.id === match.homeTeam.id ? m.goals.home : m.goals.away;
        const awayGoals =
          m.awayTeam.id === match.awayTeam.id ? m.goals.away : m.goals.home;
        return `${m.homeTeam.name} ${homeGoals}-${awayGoals} ${m.awayTeam.name}`;
      })
      .join(', ');

    return `
Analyze this upcoming match and provide a prediction in JSON format:

Match: ${match.homeTeam.name} vs ${match.awayTeam.name}
League: ${match.league.name}
Date: ${match.date}

Head-to-Head (last 5): ${h2hSummary || 'No data'}

${match.homeTeam.name} recent form: ${this.calculateForm(homeForm, match.homeTeam.id)}
${match.awayTeam.name} recent form: ${this.calculateForm(awayForm, match.awayTeam.id)}

${homePos ? `${match.homeTeam.name} league position: ${homePos}` : ''}
${awayPos ? `${match.awayTeam.name} league position: ${awayPos}` : ''}

Provide prediction in this exact JSON format:
{
  "winner": "home" or "away" or "draw",
  "homeWinProb": number (0-100),
  "drawProb": number (0-100),
  "awayWinProb": number (0-100),
  "predictedScore": {
    "home": number,
    "away": number
  },
  "advice": "brief betting advice",
  "analysis": {
    "uz": "analysis in Uzbek",
    "ru": "analysis in Russian",
    "en": "analysis in English"
  },
  "confidence": number (0-100)
}
`;
  }

  private parseGptResponse(response: string): any {
    try {
      // JSON 추출 (마크다운 코드블록 제거)
      const jsonMatch =
        response.match(/```json\n([\s\S]*?)\n```/) ||
        response.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response;
      return JSON.parse(jsonStr);
    } catch (error) {
      // 파싱 실패 시 기본값
      return {
        winner: 'draw',
        homeWinProb: 33,
        drawProb: 34,
        awayWinProb: 33,
        predictedScore: { home: 1, away: 1 },
        advice: 'Analysis unavailable',
        analysis: {
          uz: 'Tahlil mavjud emas',
          ru: 'Анализ недоступен',
          en: 'Analysis unavailable',
        },
        confidence: 50,
      };
    }
  }

  private calculateForm(matches: any[], teamId: number): string {
    return matches
      .map((m) => {
        const isHome = m.homeTeam.id === teamId;
        const teamGoals = isHome ? m.goals.home : m.goals.away;
        const oppGoals = isHome ? m.goals.away : m.goals.home;

        if (teamGoals > oppGoals) return 'W';
        if (teamGoals < oppGoals) return 'L';
        return 'D';
      })
      .join('');
  }
}
