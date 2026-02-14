import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port: this.config.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });
  }

  async sendVerificationEmail(
    email: string,
    token: string,
    language: string = 'uz',
  ) {
    const verifyUrl = `${this.config.get('FRONTEND_URL')}/verify-email?token=${token}`;

    const subjects = {
      uz: 'Email manzilingizni tasdiqlang',
      ru: 'Подтвердите ваш email',
      en: 'Verify your email',
    };

    const contents = {
      uz: `Emailingizni tasdiqlash uchun quyidagi havolani bosing: ${verifyUrl}`,
      ru: `Нажмите на ссылку для подтверждения email: ${verifyUrl}`,
      en: `Click the link to verify your email: ${verifyUrl}`,
    };

    await this.transporter.sendMail({
      from: this.config.get('SMTP_FROM'),
      to: email,
      subject: subjects[language] || subjects.uz,
      html: `
        <h1>${subjects[language]}</h1>
        <p>${contents[language]}</p>
        <a href="${verifyUrl}">Verify Email</a>
      `,
    });
  }
}
