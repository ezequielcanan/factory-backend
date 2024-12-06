import { Controller, Delete, Get, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from "fs"
import * as path from 'path';
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
    /*fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },*/
  }))
  uploadSingle(@UploadedFile() file: Express.Multer.File) {
    return {
      message: 'File uploaded successfully!',
      file: file,
    };
  }

  @Get("check")
  async checkIfDirectoryHasFiles(@Query("path") path: string) {
    try {
      const directoryPath = `./uploads/${path}`;

      if (!fs.existsSync(directoryPath)) {
        return {
          files: []
        };
      }

      const files = fs.readdirSync(directoryPath);

      return {
        files
      };
    } catch (error) {
      return {
        message: 'Error checking directory',
        error: error.message,
        files: [],
      };
    }
  }

  @Delete('clear')
  async clearDirectory(@Query('path') dirPath: string) {
    try {
      const directoryPath = `./uploads/${dirPath}`;

      if (!fs.existsSync(directoryPath)) {
        return {
          message: 'Directory does not exist',
        };
      }

      const files = fs.readdirSync(directoryPath);
      files.forEach((file) => {
        const filePath = path.join(directoryPath, file);
        fs.unlinkSync(filePath);
      });

      return {
        message: 'All files deleted successfully',
      };
    } catch (error) {
      return {
        message: 'Error clearing directory',
        error: error.message,
      };
    }
  }
}
