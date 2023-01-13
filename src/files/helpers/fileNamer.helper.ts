import { HttpException, HttpStatus } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

export const fileNamer = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  if (!file)
    return callback(
      new HttpException('File is Empty!', HttpStatus.BAD_REQUEST),
      false,
    );

  const fileExtension = file.mimetype.split('/')[1];
  const fileName = `${uuid()}.${fileExtension}`;

  callback(null, fileName);
};
