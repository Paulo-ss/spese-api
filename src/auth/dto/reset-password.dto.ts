export class ResetPasswordDto {
  public resetToken: string;
  public password: string;
  public passwordConfirmation: string;
}
