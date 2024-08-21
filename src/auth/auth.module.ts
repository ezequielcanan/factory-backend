import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from 'src/users/schema/users.schema';

@Module({
  imports: [UsersModule,
    PassportModule,
    MongooseModule.forFeature([
      {name: User.name, schema: User}
    ]),
    JwtModule.register({
      secret: "fabric",
      signOptions: { expiresIn: '24h' },
    })],
  controllers: [AuthController],
  providers: [AuthService, UsersService, LocalStrategy, JwtStrategy]
})
export class AuthModule {}
