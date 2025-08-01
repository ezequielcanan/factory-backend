import { Controller, Post, Request, UseGuards, Body, Param, Get } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local.guard';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Role } from './enums/role.enum';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private usersService: UsersService) {}

  @Post("register")
  async register(@Body() user: RegisterDto) {
    return this.authService.register(user)
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Request() req: any) {
    return this.authService.login(req.user?._doc);
  }

  @UseGuards(JwtAuthGuard)
  @Get("current")
  async current(@Request() req: any) {
    return this.usersService.findOneById(req?.user?._id)
  }
}
