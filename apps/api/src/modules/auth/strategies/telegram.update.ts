import { Update, Start, Ctx } from 'nestjs-telegraf';
import { AuthService } from '../auth.service';

@Update()
export class TelegramUpdate {
  constructor(private readonly authService: AuthService) {}

  @Start()
  async onStart(@Ctx() ctx: any) {
    const telegramUser = ctx.from; // 텔레그램 아이디, 이름 등

    // 앱에서 파라미터로 몰래 넘긴 랜덤 열쇠 추출 (예: /start abc-123)
    const messageText = ctx.message.text;
    const loginToken = messageText.split(' ')[1];
    if (loginToken) {
      // 서비스에 열쇠와 유저 정보를 넘겨서 인증 완료 처리
      await this.authService.completeTelegramLogin(loginToken, telegramUser);
      await ctx.reply(
        `환영합니다, ${telegramUser.first_name}님! 앱으로 돌아가주세요.`,
      );
    } else {
      await ctx.reply('이 봇은 앱 로그인 전용입니다.');
    }
  }
}
