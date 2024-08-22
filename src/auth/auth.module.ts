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
import { User, UserSchema } from 'src/users/schema/users.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {name: User.name, useFactory: () => {
        const schema = UserSchema;
        schema.plugin(require('mongoose-unique-validator'), { message: 'your custom message' }); // or you can integrate it without the options   schema.plugin(require('mongoose-unique-validator')
        return schema;
      }}
    ]),
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: "fabric",
      signOptions: { expiresIn: '24h' },
    })],
  controllers: [AuthController],
  providers: [AuthService, UsersService, LocalStrategy, JwtStrategy]
})
export class AuthModule {}
