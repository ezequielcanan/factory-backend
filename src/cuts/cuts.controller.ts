import { Controller, Get } from '@nestjs/common';
import { CutsService } from './cuts.service';

@Controller('cuts')
export class CutsController {
  constructor(
    private readonly cutsService: CutsService
  ) {}

  @Get()
  async getCuts() {
    return await this.cutsService.getCuts()
  }
}
