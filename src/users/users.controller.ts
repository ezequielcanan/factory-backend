import { Controller, Get, Param, Put, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService
  ) {}

  @Get()
  async getUsers() {
    return this.usersService.getUsers()
  }

  @Put("/toggle/:id")
  async toggleRole(@Param("id") id: string, @Query("role") role: string) {
    return this.usersService.toggleRole(id, role)
  }
}
