import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('Health Probes', () => {
    it('should return "OK" for health probe', () => {
      expect(appController.getHealth()).toBe('OK');
    });

    it('should return "READY" for readiness probe', () => {
      expect(appController.getReady()).toBe('READY');
    });
  });
});
