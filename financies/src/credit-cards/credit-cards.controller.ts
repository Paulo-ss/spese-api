import { Controller } from '@nestjs/common';
import { CreditCardsService } from './credit-cards.service';

@Controller('credit-cards')
export class CreditCardsController {
  constructor(private readonly creditCardsService: CreditCardsService) {}
}
