import { Job } from 'bullmq';
import { randomInt } from 'crypto';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { MagicWorkshopService } from '@src/modules/magic-workshop/magic-workshop.service';
import { MagicItemQualityLevel } from '@src/modules/magic-workshop/entities/magic-item-craft-task.entity';
import { BULLMQ_JOBS, BULLMQ_QUEUES } from '@src/infrastructure/bullmq/bullmq.constants';
import { MagicCraftPayload } from '@src/infrastructure/bullmq/contracts/magic-craft.contract';

const CRAFT_JOB_NAME = BULLMQ_JOBS.MAGIC_CRAFT.CRAFT;

@Injectable()
@Processor(BULLMQ_QUEUES.MAGIC_CRAFT)
export class CraftConsumer extends WorkerHost {
  private readonly logger = new Logger(CraftConsumer.name);

  constructor(private readonly magicWorkshopService: MagicWorkshopService) {
    super();
  }

  async process(job: Job<MagicCraftPayload>): Promise<{ success: boolean }> {
    const payload = job.data;
    const craftLogLines: string[] = [];

    const waitMs = 2000 + randomInt(3000);
    craftLogLines.push(`开始加工任务 ${payload.taskId}，预计耗时 ${waitMs}ms。`);
    if (payload.requestNote) {
      craftLogLines.push(`客户备注: ${payload.requestNote}`);
    }
    craftLogLines.push(`材料等级 ${payload.materialLevel}，道具类型 ${payload.itemType}。`);

    try {
      await new Promise<void>((resolve) => setTimeout(resolve, waitMs));

      const quality = this.pickQuality(payload.materialLevel);
      craftLogLines.push(`加工完成，判定品质为 ${quality}。`);

      const resultDescription = this.buildResultDescription(payload.itemName, quality, payload.materialLevel);
      craftLogLines.push(`生成结果描述：${resultDescription}`);

      const craftLog = craftLogLines.join('\n');
      await this.magicWorkshopService.completeMagicItemCraftTask(payload.taskId, {
        qualityLevel: quality,
        resultDescription,
        craftLog,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      craftLogLines.push(`加工失败：${errorMessage}`);
      const craftLog = craftLogLines.join('\n');

      await this.magicWorkshopService.failMagicItemCraftTask(payload.taskId, errorMessage, craftLog);
      this.logger.error({ jobId: job.id, error: errorMessage }, '魔法制作任务处理失败');

      return { success: false };
    }
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job<MagicCraftPayload>): Promise<void> {
    if (job.name !== CRAFT_JOB_NAME) {
      return;
    }
    this.logger.log(`魔法制作任务 ${job.id} 已成功处理`);
  }

  private pickQuality(materialLevel: number): MagicItemQualityLevel {
    const weights: Record<number, ReadonlyArray<number>> = {
      1: [80, 15, 4, 1],
      2: [60, 25, 10, 5],
      3: [35, 35, 20, 10],
      4: [20, 35, 30, 15],
      5: [10, 25, 35, 30],
    };
    const values = weights[materialLevel] ?? weights[1];
    const threshold = randomInt(100);
    let sum = 0;

    const qualities: MagicItemQualityLevel[] = [
      MagicItemQualityLevel.COMMON,
      MagicItemQualityLevel.RARE,
      MagicItemQualityLevel.EPIC,
      MagicItemQualityLevel.LEGENDARY,
    ];

    for (let i = 0; i < values.length; i += 1) {
      sum += values[i];
      if (threshold < sum) {
        return qualities[i];
      }
    }

    return MagicItemQualityLevel.COMMON;
  }

  private buildResultDescription(
    itemName: string,
    quality: MagicItemQualityLevel,
    materialLevel: number,
  ): string {
    return `【${itemName}】使用材料等级 ${materialLevel} 加工完成，最终获得 ${quality} 品质。`;
  }
}
