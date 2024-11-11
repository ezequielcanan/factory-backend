import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CutsService } from './cuts.service';
import { CreateCutDto } from './dto/create-cut.dto';

@Controller('cuts')
export class CutsController {
  constructor(
    private readonly cutsService: CutsService
  ) {}

  @Get()
  async getCuts(@Query("one") one: string, @Query("two") two: string, @Query("three") three: string,) {
    return this.cutsService.getCuts(one, two, three)
  }

  @Get("/finished")
  async getFinishedCuts() {
    return this.cutsService.getFinishedCuts()
  }
  
  @Get("/:id")
  async getCut(@Param("id") id: string) {
    return this.cutsService.getCut(id)
  }

  @Post()
  async createCut(@Body() cut: CreateCutDto) {
    return this.cutsService.createManualCut(cut)
  }

  @Put("/:id")
  async updateCut(@Param("id") id: string, @Query("property") property: string, @Query("value") value: string) {
    return this.cutsService.updateCut(id, property, value)
  }

  @Delete("/:id")
  async deleteCut(@Param("id") id: string) {
    return this.cutsService.deleteCut(id)
  }
}
