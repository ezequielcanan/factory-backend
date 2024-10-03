import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ConfigService } from '@nestjs/config';
import { CreateClientDto } from './dto/create-client.dto';

@Controller('clients')
export class ClientsController {
  constructor(
    private readonly clientsService: ClientsService
  ) {}

  @Post()
  async createClient(@Body() client: CreateClientDto) {
    return this.clientsService.createClient(client)
  }

  @Get()
  async getClients(@Query("sort") sort: string, @Query("page") page: string) {
    return this.clientsService.getClients(sort ? true : false, page)
  }
  
  @Get("/:id")
  async getClient(@Param("id") id: string) {
    return this.clientsService.getClient(id)
  }

  @Put("/:id")
  async updateClient(@Param("id") id: string, @Body() client: CreateClientDto) {
    return this.clientsService.updateClient(id, client)
  }
}
