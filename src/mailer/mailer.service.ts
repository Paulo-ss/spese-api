import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transporter, createTransport } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { ITemplateData } from './interfaces/template-data.interface';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ITemplates } from './interfaces/templates.interface';
import * as Handlebars from 'handlebars';
import { IEmailConfig } from 'src/config/interfaces/emai.interface';

@Injectable()
export class MailerService {
  private readonly loggerService: LoggerService;
  private readonly transport: Transporter<SMTPTransport.SentMessageInfo>;
  private readonly email: string;
  private readonly domain: string;
  private readonly templates: ITemplates;

  constructor(private readonly configService: ConfigService) {
    const emailConfig = this.configService.get<IEmailConfig>('emailConfig');
    this.transport = createTransport(emailConfig);
    this.email = `Spese <${emailConfig.auth.user}>`;
    this.domain = this.configService.get<string>('domain');
    this.loggerService = new Logger(MailerService.name);
    this.templates = {
      confirmation: MailerService.parseTemplate('confirmation.hbs'),
      resetPassword: MailerService.parseTemplate('reset-password.hbs'),
    };
  }

  private static parseTemplate(
    templateName: string,
  ): Handlebars.TemplateDelegate<ITemplateData> {
    const templateText = readFileSync(
      join(__dirname, 'templates', templateName),
      'utf-8',
    );

    return Handlebars.compile<ITemplateData>(templateText, { strict: true });
  }

  private sendEmail(
    to: string,
    subject: string,
    html: string,
    log?: string,
  ): void {
    this.transport
      .sendMail({ from: this.email, to, subject, html })
      .then(() => this.loggerService.log(log ?? 'A new e-mail was sent.'))
      .catch((error) => this.loggerService.error(error));
  }

  public sendConfirmationEmail(
    email: string,
    name: string,
    token: string,
  ): void {
    const subject = 'Confirme o seu e-mail';
    const html = this.templates.confirmation({
      name,
      link: `${this.domain}/auth/confirm/${token}`,
    });

    this.sendEmail(email, subject, html, 'A new confirmation email was sent.');
  }

  public sendResetPasswordEmail(
    email: string,
    name: string,
    token: string,
  ): void {
    const subject = 'Redefinição de senha';
    const html = this.templates.resetPassword({
      name,
      link: `${this.domain}/auth/reset-password/${token}`,
    });

    this.sendEmail(
      email,
      subject,
      html,
      'A new reset password email was sent.',
    );
  }
}
