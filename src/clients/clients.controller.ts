import { Body, Controller, Get, Post } from '@nestjs/common';
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
  async getClients() {
    return this.clientsService.getClients()
  }
}
