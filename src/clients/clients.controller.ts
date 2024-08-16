import { Controller } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ConfigService } from '@nestjs/config';

@Controller('clients')
export class ClientsController {
  constructor(
    private readonly clientsSchema: ClientsService,
    private config: ConfigService
  ) {}
}
