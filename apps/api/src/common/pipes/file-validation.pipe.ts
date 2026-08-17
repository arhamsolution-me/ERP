import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import * as path from 'path';

export interface FileValidationOptions {
  maxSizeBytes?: number;
  allowedExtensions?: string[];
  allowedMimeTypes?: string[];
}

export interface UploadedFileDto {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly maxSizeBytes: number;
  private readonly allowedExtensions: Set<string>;
  private readonly allowedMimeTypes: Set<string>;

  constructor(options?: FileValidationOptions) {
    this.maxSizeBytes = options?.maxSizeBytes || 5 * 1024 * 1024; // 5MB default
    this.allowedExtensions = new Set(
      (options?.allowedExtensions || ['.pdf', '.png', '.jpg', '.jpeg', '.csv', '.xlsx']).map(e => e.toLowerCase()),
    );
    this.allowedMimeTypes = new Set(
      options?.allowedMimeTypes || [
        'application/pdf',
        'image/png',
        'image/jpeg',
        'text/csv',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
    );
  }

  transform(file: UploadedFileDto): UploadedFileDto {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // 1. Enforce file size limit
    if (file.size > this.maxSizeBytes) {
      throw new BadRequestException(
        `File size exceeds limit of ${this.maxSizeBytes / (1024 * 1024)}MB`,
      );
    }

    // 2. Prevent path traversal in originalname
    const sanitizedBaseName = path.basename(file.originalname);
    if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
      file.originalname = sanitizedBaseName;
    }

    // 3. Validate file extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!this.allowedExtensions.has(ext)) {
      throw new BadRequestException(`File extension '${ext}' is not permitted`);
    }

    // 4. Validate MIME type
    if (!this.allowedMimeTypes.has(file.mimetype.toLowerCase())) {
      throw new BadRequestException(`MIME type '${file.mimetype}' is not permitted`);
    }

    return file;
  }
}
