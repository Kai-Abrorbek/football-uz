import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class GptService {
  private readonly logger = new Logger(GptService.name);
  private openai: OpenAI;
  private model: string;

  constructor(private config: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.config.get('OPENAI_API_KEY'),
    });
    this.model = this.config.get('OPENAI_MODEL') || 'gpt-4o-mini';
  }

  public async generatePrediction(prompt: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a professional football analyst. Analyze matches and provide detailed predictions based on statistics, form, and head-to-head records.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      this.logger.error('GPT API error', error);
      throw error;
    }
  }

  async generateChatResponse(messages: any[]): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a friendly football expert assistant. Answer questions about football matches, teams, players, and statistics in a conversational way.',
          },
          ...messages,
        ],
        temperature: 0.8,
        max_tokens: 500,
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      this.logger.error('GPT API error', error);
      throw error;
    }
  }
}
