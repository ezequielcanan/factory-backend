import { Module } from '@nestjs/common';
import { UploadfilesController } from './uploadfiles.controller';

@Module({
  controllers: [UploadfilesController]
})
export class UploadfilesModule {}
