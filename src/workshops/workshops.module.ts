import { Module } from '@nestjs/common';
import { WorkshopsController } from './workshops.controller';
import { WorkshopsService } from './workshops.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Workshop, WorkshopSchema } from './schema/workshops.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{name: Workshop.name, schema: WorkshopSchema}]
    )
  ],
  controllers: [WorkshopsController],
  providers: [WorkshopsService]
})
export class WorkshopsModule {}
