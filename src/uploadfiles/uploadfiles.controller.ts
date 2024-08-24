import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from "fs"
import { extname } from 'path';

@Controller('upload')
export class UploadfilesController {
  
  @Post('single')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        if (!fs.existsSync(`./uploads/${req?.query?.path}`)) {
          fs.mkdirSync(`./uploads/${req?.query?.path}`, { recursive: true });
        }

        cb(null, `${req?.query?.path}/${req?.query?.name || file.originalname}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
  }))
  uploadSingle(@UploadedFile() file: Express.Multer.File) {
    return {
      message: 'File uploaded successfully!',
      file: file,
    };
  }
}
