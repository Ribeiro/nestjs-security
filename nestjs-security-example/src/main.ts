import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AntifraudInterceptor } from 'nestjs-security';
import { setupSwagger } from './swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupSwagger(app); 

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(app.get(AntifraudInterceptor));

  await app.listen(3000);
}
bootstrap();
