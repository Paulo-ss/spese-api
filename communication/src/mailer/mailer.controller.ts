import { Controller } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { SendEmailDto } from './dto/send-emai.dto';

@Controller()
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @EventPattern({ cmd: 'send-confirmation-email' })
  public async sendConfirmationEmail({ name, email, token }: SendEmailDto) {
    return this.mailerService.sendConfirmationEmail(email, name, token);
  }

  @EventPattern({ cmd: 'send-reset-password-email' })
  public async sendResetPasswordEmail({ name, email, token }: SendEmailDto) {
    return this.mailerService.sendResetPasswordEmail(email, name, token);
  }
}
