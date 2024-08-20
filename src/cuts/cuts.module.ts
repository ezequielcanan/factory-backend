import { Module } from '@nestjs/common';
import { CutsController } from './cuts.controller';
import { CutsService } from './cuts.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Cuts, CutsSchema } from './schema/cuts.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Cuts.name, schema: CutsSchema}
    ])
  ],
  controllers: [CutsController],
  providers: [CutsService]
})
export class CutsModule {}
