import { FileValidationPipe, UploadedFileDto } from './file-validation.pipe';
import { BadRequestException } from '@nestjs/common';

describe('File Upload Security & Validation (FileValidationPipe)', () => {
  let pipe: FileValidationPipe;

  beforeEach(() => {
    pipe = new FileValidationPipe();
  });

  function createMockFile(overrides: Partial<UploadedFileDto> = {}): UploadedFileDto {
    return {
      fieldname: 'document',
      originalname: 'export-invoice.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: 1024 * 1024, // 1MB
      ...overrides,
    };
  }

  it('should accept valid PDF and image files within size limit', () => {
    const validPdf = createMockFile();
    const result = pipe.transform(validPdf);
    expect(result.originalname).toBe('export-invoice.pdf');

    const validPng = createMockFile({ originalname: 'receipt.png', mimetype: 'image/png' });
    expect(pipe.transform(validPng).originalname).toBe('receipt.png');
  });

  it('should reject files that exceed maximum size limit (5MB)', () => {
    const oversized = createMockFile({ size: 10 * 1024 * 1024 }); // 10MB
    expect(() => pipe.transform(oversized)).toThrow(BadRequestException);
  });

  it('should reject forbidden file extensions (.exe, .sh, .php, .js)', () => {
    const dangerousExe = createMockFile({ originalname: 'malware.exe', mimetype: 'application/octet-stream' });
    expect(() => pipe.transform(dangerousExe)).toThrow(BadRequestException);

    const scriptFile = createMockFile({ originalname: 'exploit.sh', mimetype: 'text/x-shellscript' });
    expect(() => pipe.transform(scriptFile)).toThrow(BadRequestException);
  });

  it('should sanitize path traversal attempts in original filename', () => {
    const traversalFile = createMockFile({ originalname: '../../../../etc/passwd.pdf' });
    const result = pipe.transform(traversalFile);
    expect(result.originalname).toBe('passwd.pdf');
    expect(result.originalname).not.toContain('..');
  });

  it('should reject spoofed MIME types that do not match permitted types', () => {
    const spoofed = createMockFile({ originalname: 'payload.pdf', mimetype: 'application/x-msdownload' });
    expect(() => pipe.transform(spoofed)).toThrow(BadRequestException);
  });
});
