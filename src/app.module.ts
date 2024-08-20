import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticlesModule } from './articles/articles.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersModule } from './orders/orders.module';
import { ClientsModule } from './clients/clients.module';
import { CutsModule } from './cuts/cuts.module';

@Module({
  imports: [
    ArticlesModule,
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async(config: ConfigService) => ({
        uri: config.get<string>('MONGO_URL'),
        dbName: config.get<string>('MONGO_DBNAME')
      })
    }),
    OrdersModule,
    ClientsModule,
    CutsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
