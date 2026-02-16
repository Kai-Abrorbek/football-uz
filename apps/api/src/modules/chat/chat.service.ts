import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ChatMessage,
  ChatMessageDocument,
} from '../../schemas/chat-message.schema';
import { GptService } from '../predictions/gpt.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatMessage.name)
    private chatModel: Model<ChatMessageDocument>,
    private gptService: GptService,
  ) {}

  public async sendMessage(
    userId: string,
    message: string,
    language: string = 'uz',
    sessionId?: string,
  ) {
    // 세션 ID 없으면 생성
    if (!sessionId) {
      sessionId = uuidv4();
    }

    // 기존 대화 조회
    let chatSession = await this.chatModel.findOne({ sessionId });

    if (!chatSession) {
      // 새 세션 생성
      chatSession = await this.chatModel.create({
        userId,
        sessionId,
        messages: [],
        language,
        tokensUsed: 0,
      });
    }

    // 유저 메시지 추가
    chatSession.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // GPT 호출용 메시지 배열
    const gptMessages = chatSession.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // 시스템 프롬프트 (언어별)
    const systemPrompts = {
      uz: "Siz professional futbol eksperti assistentisiz.Foydalanuvchi so'ragan ma'lumotlarni DATABASE dan topib bering.Agar ma'lumot bo'lmasa, shunchaki bilmasligingizni ayting.Har doim o'zbek tilida javob bering.",
      ru: 'Вы профессиональный футбольный эксперт-ассистент. Отвечайте на вопросы о футбольных матчах, командах, игроках и статистике дружелюбно и информативно. Всегда отвечайте на русском языке.',
      en: 'You are a professional football expert assistant. Answer questions about football matches, teams, players, and statistics in a friendly and informative way. Always respond in English.',
    };

    const fullMessages = [
      { role: 'system', content: systemPrompts[language] || systemPrompts.uz },
      ...gptMessages,
    ];

    // GPT 응답 받기
    const response = await this.gptService.generateChatResponse(fullMessages);

    // 어시스턴트 응답 추가
    chatSession.messages.push({
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    });

    // 토큰 사용량 추정 (대략)
    const estimatedTokens = message.length / 4 + response.length / 4;
    chatSession.tokensUsed += Math.ceil(estimatedTokens);

    await chatSession.save();

    return {
      sessionId: chatSession.sessionId,
      message: response,
      tokensUsed: chatSession.tokensUsed,
    };
  }

  public async getSession(sessionId: string) {
    const session = await this.chatModel.findOne({ sessionId });
    if (!session) {
      throw new NotFoundException('세션을 찾을 수 없습니다');
    }
    return session;
  }

  public async getUserSessions(userId: string) {
    return this.chatModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .exec();
  }

  public async deleteSession(sessionId: string) {
    const result = await this.chatModel.deleteOne({ sessionId });
    if (result.deletedCount === 0) {
      throw new NotFoundException('세션을 찾을 수 없습니다');
    }
    return { message: '세션이 삭제되었습니다' };
  }
}
