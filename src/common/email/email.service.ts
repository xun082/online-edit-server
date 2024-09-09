import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { ConfigService } from '@nestjs/config';

import loadEmailConfig from '../../config/email.config';
import { LoggerService } from '../logs/logs.service';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private emailConfig: ReturnType<typeof loadEmailConfig>;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.emailConfig = loadEmailConfig(this.configService);

    this.transporter = nodemailer.createTransport({
      host: this.emailConfig.host,
      port: this.emailConfig.port,
      secure: false,
      auth: {
        user: this.emailConfig.authUser,
        pass: this.emailConfig.authPass,
      },
    });

    this.verifyTransporter();
  }

  private async verifyTransporter(): Promise<void> {
    try {
      await this.transporter.verify();
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Email transporter verification failed');
    }
  }

  async sendMail(to: string, subject: string, text: string, html?: string): Promise<void> {
    try {
      const mailOptions = {
        from: this.emailConfig.authUser,
        to,
        subject,
        text,
        html,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
