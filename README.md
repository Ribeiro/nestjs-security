
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuditModule } from 'nestjs-security';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // <- necessário!
    AuditModule.forRootAsync(),
  ],
})
export class AppModule {}

```