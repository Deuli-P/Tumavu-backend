import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Module global pour ne pas re-declarer Prisma dans chaque module.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
