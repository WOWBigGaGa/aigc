// src/modules/verification-record/verification-record.module.ts

import { PasswordModule } from '@modules/common/password/password.module';
import { VerificationCodeHelper } from './verification-code.helper';
import { AccountInstallerModule } from '@modules/account/account-installer.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsumableQueryService } from './queries/consumable.query.service';
import { VerificationRecordQueryService } from './queries/verification-record.query.service';
import { VerificationRecordReadRepository } from './repositories/verification-record.read.repo';
import { VerificationReadService } from './services/verification-read.service';
import { VerificationRecordEntity } from './verification-record.entity';
import { VerificationRecordService } from './verification-record.service';

/**
 * 验证记录模块
 * 提供统一的验证/邀请记录管理功能
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([VerificationRecordEntity]),
    AccountInstallerModule, // 导入 AccountInstallerModule 以提供 AccountService
    PasswordModule, // 导入 PasswordModule 以提供 PasswordPolicyService
  ],
  providers: [
    VerificationRecordService,
    VerificationRecordReadRepository,
    VerificationReadService,
    ConsumableQueryService,
    VerificationRecordQueryService,
    VerificationCodeHelper,
  ],
  exports: [
    TypeOrmModule,
    VerificationRecordService,
    VerificationRecordReadRepository,
    VerificationReadService,
    ConsumableQueryService,
    VerificationRecordQueryService,
    VerificationCodeHelper,
  ],
})
export class VerificationRecordModule {}
