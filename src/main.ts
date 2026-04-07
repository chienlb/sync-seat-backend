import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import envConfig from './configs/env.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const config = envConfig();
  // 1. Bảo mật với Helmet (Chống XSS, Clickjacking...)
  app.use(helmet());

  // 2. Nén dữ liệu gửi đi để tăng tốc độ load ứng dụng
  app.use(compression());

  // 3. Cấu hình CORS (Cho phép Frontend truy cập)
  app.enableCors({
    origin: true, // Trong production nên chỉ định domain cụ thể
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.setGlobalPrefix(config.apiPrefix);

  // 5. Cấu hình Validation toàn cục (Tự động kiểm tra dữ liệu đầu vào)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ các trường không được định nghĩa trong DTO
      forbidNonWhitelisted: true, // Báo lỗi nếu gửi trường lạ
      transform: true, // Tự động chuyển kiểu dữ liệu (ví dụ: string sang number)
    }),
  );

  // 7. Lắng nghe cổng từ .env
  const port = config.port;
  await app.listen(port);
  
  logger.log(`🚀 Application is running on: http://localhost:${port}/${config.apiPrefix}`);
}

bootstrap();