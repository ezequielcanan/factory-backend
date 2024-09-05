import { Controller, Get, Param } from '@nestjs/common';
import { CutsService } from './cuts.service';

@Controller('cuts')
export class CutsController {
  constructor(
    private readonly cutsService: CutsService
  ) {}

  @Get()
  async getCuts() {
    return this.cutsService.getCuts()
  }

  @Get("/:id")
  async getCut(@Param("id") id: string) {
    return this.cutsService.getCut(id)
  }
}
