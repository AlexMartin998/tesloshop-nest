import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helpers';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  private readonly hostApi: string;

  constructor(
    private readonly filesService: FilesService,

    private readonly configService: ConfigService,
  ) {
    this.hostApi = configService.get<string>('hostApi');
  }

  @Post('product')
  @UseInterceptors(
    // file - como envia el body
    FileInterceptor('file', {
      fileFilter: fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      // root dir/
      storage: diskStorage({
        destination: './static/products',
        filename: fileNamer,
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    // este file ya lo podriamos enviar un 3ro como cloudinary
    if (!file) throw new BadRequestException('Image is required!');
    // console.log(file);

    const secureUrl = `${this.hostApi}/files/product/${file.filename}`;

    return { secureUrl };
  }

  @Get('product/:imageName')
  findProductImg(
    @Res() res: Response, // al importarlo, Nest pierde control sobre la res de este method
    @Param('imageName') imageName: string,
  ) {
    const path = this.filesService.getStaticProductImg(imageName);

    res.sendFile(path);
  }
}
