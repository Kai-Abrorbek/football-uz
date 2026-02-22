import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ChatMessage,
  ChatMessageDocument,
} from '../../schemas/chat-message.schema';
import { Match, MatchDocument } from '../../schemas/match.schema';
import { Team, TeamDocument } from '../../schemas/team.schema';
import { Player, PlayerDocument } from '../../schemas/player.schema';
import { Standing, StandingDocument } from '../../schemas/standing.schema';
import { GptService } from '../predictions/gpt.service';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatService {
  private openai: OpenAI;

  constructor(
    @InjectModel(ChatMessage.name)
    private chatModel: Model<ChatMessageDocument>,
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
    @InjectModel(Standing.name) private standingModel: Model<StandingDocument>,
    private gptService: GptService,
    private config: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.config.get('OPENAI_API_KEY'),
    });
  }

  async sendMessage(
    userId: string,
    message: string,
    language: string = 'uz',
    sessionId?: string,
  ) {
    if (!sessionId) {
      sessionId = uuidv4();
    }

    let chatSession = await this.chatModel.findOne({ sessionId });

    if (!chatSession) {
      chatSession = await this.chatModel.create({
        userId,
        sessionId,
        messages: [],
        language,
        tokensUsed: 0,
      });
    }

    chatSession.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Function Calling 설정
    const tools = [
      {
        type: 'function',
        function: {
          name: 'getTeamMatches',
          description:
            'Get recent or upcoming matches for a specific team. Use this when user asks about team matches, fixtures, or results.',
          parameters: {
            type: 'object',
            properties: {
              teamName: {
                type: 'string',
                description:
                  'Name of the team (e.g., "Manchester United", "Arsenal", "Real Madrid", "Bayern Munich")',
              },
              limit: {
                type: 'number',
                description: 'Number of matches to return (default: 5)',
                default: 5,
              },
            },
            required: ['teamName'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'getStandings',
          description:
            'Get current league standings/table. Use this when user asks about league rankings, positions, table, or standings.',
          parameters: {
            type: 'object',
            properties: {
              leagueName: {
                type: 'string',
                description:
                  'Name of the league. Must be one of: "Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1"',
                enum: [
                  'Premier League',
                  'La Liga',
                  'Serie A',
                  'Bundesliga',
                  'Ligue 1',
                ],
              },
            },
            required: ['leagueName'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'getPlayerInfo',
          description:
            'Get detailed information about a specific football player. Use this when user asks about player stats, team, position, or nationality.',
          parameters: {
            type: 'object',
            properties: {
              playerName: {
                type: 'string',
                description:
                  'Full name or commonly known name of the player (e.g., "Cristiano Ronaldo", "Messi", "Salah")',
              },
            },
            required: ['playerName'],
          },
        },
      },
    ];

    const systemPrompts = {
      uz: `Siz professional futbol ma'lumotlar bazasi assistentisiz. 
  
      MUHIM QOIDALAR:
      1. Har doim database dan ma'lumot olish uchun function larni chaqiring
      2. "Bilmayman" yoki "ma'lumot yo'q" deb javob bermang
      3. Foydalanuvchi savoli bo'yicha tegishli function ni ishlatib, aniq ma'lumot bering

      Mavjud function lar:
      - getTeamMatches: Jamoa o'yinlarini olish
      - getStandings: Liga turnir jadvalini olish  
      - getPlayerInfo: Futbolchi ma'lumotini olish`,

      ru: `Вы профессиональный футбольный ассистент с базой данных.

      ВАЖНЫЕ ПРАВИЛА:
      1. Всегда используйте функции для получения данных из базы
      2. Не говорите "не знаю" или "нет информации"
      3. По запросу пользователя используйте соответствующую функцию и дайте точный ответ

      Доступные функции:
      - getTeamMatches: Получить матчи команды
      - getStandings: Получить турнирную таблицу
      - getPlayerInfo: Получить информацию об игроке`,

      en: `You are a professional football database assistant.

      IMPORTANT RULES:
      1. Always use functions to get data from database
      2. Never say "I don't know" or "no information available"
      3. Based on user's question, use the appropriate function and provide accurate data

      Available functions:
      - getTeamMatches: Get team matches
      - getStandings: Get league standings
      - getPlayerInfo: Get player information`,
    };

    const gptMessages = chatSession.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const fullMessages = [
      { role: 'system', content: systemPrompts[language] || systemPrompts.uz },
      ...gptMessages,
    ];

    // GPT 호출 (Function Calling)
    let response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: fullMessages as any,
      tools: tools as any,
      tool_choice: 'required',
    });

    let assistantMessage = response.choices[0].message;

    // Function 호출 처리
    // Function 호출 처리
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      for (const toolCall of assistantMessage.tool_calls) {
        const functionName = (toolCall as any).function.name;
        const functionArgs = JSON.parse((toolCall as any).function.arguments);

        let functionResult: any;

        switch (functionName) {
          case 'getTeamMatches':
            functionResult = await this.getTeamMatches(
              functionArgs.teamName,
              functionArgs.limit || 5,
            );
            break;
          case 'getStandings':
            functionResult = await this.getStandings(functionArgs.leagueName);
            break;
          case 'getPlayerInfo':
            functionResult = await this.getPlayerInfo(functionArgs.playerName);
            break;
          default:
            functionResult = { error: 'Unknown function' };
        }

        // Function 결과를 GPT에 전달
        fullMessages.push(assistantMessage as any);
        fullMessages.push({
          role: 'tool',
          tool_call_id: (toolCall as any).id,
          content: JSON.stringify(functionResult),
        } as any);
      }

      // 다시 GPT 호출
      response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: fullMessages as any,
      });

      assistantMessage = response.choices[0].message;
    }

    const finalResponse = assistantMessage.content || 'No response';

    chatSession.messages.push({
      role: 'assistant',
      content: finalResponse,
      timestamp: new Date(),
    });

    const estimatedTokens = message.length / 4 + finalResponse.length / 4;
    chatSession.tokensUsed += Math.ceil(estimatedTokens);

    await chatSession.save();

    return {
      sessionId: chatSession.sessionId,
      message: finalResponse,
      tokensUsed: chatSession.tokensUsed,
    };
  }

  private async getTeamMatches(teamName: string, limit: number) {
    const team = await this.teamModel.findOne({
      name: { $regex: teamName, $options: 'i' },
    });

    if (!team) {
      return { error: 'Team not found' };
    }

    const matches = await this.matchModel
      .find({
        $or: [
          { 'homeTeam.id': team.apiFootballId },
          { 'awayTeam.id': team.apiFootballId },
        ],
      })
      .sort({ date: -1 })
      .limit(limit)
      .exec();

    return matches.map((m) => ({
      home: m.homeTeam.name,
      away: m.awayTeam.name,
      score: `${m.goals?.home}-${m.goals?.away}`,
      status: m.status.short,
      date: m.date,
    }));
  }

  private async getStandings(leagueName: string) {
    const leagueMap: any = {
      'premier league': 39,
      'la liga': 140,
      'serie a': 135,
      bundesliga: 78,
      'ligue 1': 61,
    };

    const leagueId = leagueMap[leagueName.toLowerCase()];
    if (!leagueId) {
      return { error: 'League not found' };
    }

    const standing = await this.standingModel.findOne({
      'league.id': leagueId,
      'league.season': 2024,
    });

    if (!standing || !standing.standings[0]) {
      return { error: 'Standings not found' };
    }

    return standing.standings[0].slice(0, 10).map((entry: any) => ({
      rank: entry.rank,
      team: entry.team.name,
      points: entry.points,
      played: entry.played,
      form: entry.form,
    }));
  }

  private async getPlayerInfo(playerName: string) {
    const player = await this.playerModel.findOne({
      name: { $regex: playerName, $options: 'i' },
    });

    if (!player) {
      return { error: 'Player not found' };
    }

    return {
      name: player.name,
      team: player.currentTeam?.name,
      position: player.position,
      nationality: player.nationality,
      age: player.age,
    };
  }

  // 기존 메서드들 유지...
  async getSession(sessionId: string) {
    const session = await this.chatModel.findOne({ sessionId });
    if (!session) {
      throw new NotFoundException('세션을 찾을 수 없습니다');
    }
    return session;
  }

  async getUserSessions(userId: string) {
    return this.chatModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .exec();
  }

  async deleteSession(sessionId: string) {
    const result = await this.chatModel.deleteOne({ sessionId });
    if (result.deletedCount === 0) {
      throw new NotFoundException('세션을 찾을 수 없습니다');
    }
    return { message: '세션이 삭제되었습니다' };
  }
}
