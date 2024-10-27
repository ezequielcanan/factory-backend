import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticlesModule } from './articles/articles.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersModule } from './orders/orders.module';
import { ClientsModule } from './clients/clients.module';
import { CutsModule } from './cuts/cuts.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UploadfilesModule } from './uploadfiles/uploadfiles.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { WorkshopsModule } from './workshops/workshops.module';
import { WorkshopOrderModule } from './workshop-order/workshop-order.module';
import { PdfModule } from './pdf/pdf.module';
import { PaymentsModule } from './payments/payments.module';
import { ActivitiesModule } from './activities/activities.module';

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
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/files',
    }),
    OrdersModule,
    ClientsModule,
    CutsModule,
    AuthModule,
    UsersModule,
    UploadfilesModule,
    WorkshopsModule,
    WorkshopOrderModule,
    PdfModule,
    PaymentsModule,
    ActivitiesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
