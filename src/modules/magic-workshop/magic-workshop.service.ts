import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import {
  BULLMQ_JOBS,
  BULLMQ_QUEUES,
} from '@src/infrastructure/bullmq/bullmq.constants';
import {
  MagicItemCraftTaskEntity,
  MagicItemCraftTaskStatus,
  MagicItemQualityLevel,
} from './entities/magic-item-craft-task.entity';
import { CreateMagicItemCraftTaskInput } from './dto/create-magic-item-craft-task.input';

@Injectable()
export class MagicWorkshopService {
  private readonly magicCraftQueueName = BULLMQ_QUEUES.MAGIC_CRAFT;
  private readonly magicCraftJobName = BULLMQ_JOBS.MAGIC_CRAFT.CRAFT;

  constructor(
    @InjectRepository(MagicItemCraftTaskEntity)
    private readonly magicItemCraftTaskRepository: Repository<MagicItemCraftTaskEntity>,
    @Inject(getQueueToken(BULLMQ_QUEUES.MAGIC_CRAFT))
    private readonly magicCraftQueue: Queue,
  ) {}

  async createMagicItemCraftTask(
    input: CreateMagicItemCraftTaskInput,
  ): Promise<MagicItemCraftTaskEntity> {
    const task = this.magicItemCraftTaskRepository.create({
      itemName: input.itemName,
      itemType: input.itemType,
      materialLevel: input.materialLevel,
      requestNote: input.requestNote ?? null,
      status: MagicItemCraftTaskStatus.PENDING,
      qualityLevel: null,
      resultDescription: null,
      failureReason: null,
      craftLog: null,
    });
    const savedTask = await this.magicItemCraftTaskRepository.save(task);

    await this.magicCraftQueue.add(
      this.magicCraftJobName,
      {
        taskId: savedTask.id,
        itemName: savedTask.itemName,
        itemType: savedTask.itemType,
        materialLevel: savedTask.materialLevel,
        requestNote: savedTask.requestNote ?? undefined,
      },
      {
        jobId: savedTask.id,
      },
    );

    return savedTask;
  }

  async getMagicItemCraftTaskById(id: string): Promise<MagicItemCraftTaskEntity | null> {
    return this.magicItemCraftTaskRepository.findOne({ where: { id } });
  }

  async getAllMagicItemCraftTasks(): Promise<MagicItemCraftTaskEntity[]> {
    return this.magicItemCraftTaskRepository.find();
  }

  async completeMagicItemCraftTask(
    taskId: string,
    payload: {
      qualityLevel: MagicItemQualityLevel;
      resultDescription: string;
      craftLog: string;
    },
  ): Promise<MagicItemCraftTaskEntity | null> {
    const task = await this.magicItemCraftTaskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      return null;
    }

    task.status = MagicItemCraftTaskStatus.SUCCEEDED;
    task.qualityLevel = payload.qualityLevel;
    task.resultDescription = payload.resultDescription;
    task.craftLog = payload.craftLog;
    task.failureReason = null;

    return this.magicItemCraftTaskRepository.save(task);
  }

  async failMagicItemCraftTask(taskId: string, failureReason: string, craftLog?: string): Promise<MagicItemCraftTaskEntity | null> {
    const task = await this.magicItemCraftTaskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      return null;
    }

    task.status = MagicItemCraftTaskStatus.FAILED;
    task.failureReason = failureReason;
    task.craftLog = craftLog ?? task.craftLog;

    return this.magicItemCraftTaskRepository.save(task);
  }
}
