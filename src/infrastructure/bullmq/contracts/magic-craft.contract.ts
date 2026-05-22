// src/infrastructure/bullmq/contracts/magic-craft.contract.ts
import { BULLMQ_JOBS, BULLMQ_QUEUES } from '../bullmq.constants';
import {
  isNonEmptyString,
  isOptionalNonEmptyString,
  isRecord,
} from './shared-payload-validators';

export interface MagicCraftPayload {
  readonly taskId: string;
  readonly itemName: string;
  readonly itemType: string;
  readonly materialLevel: number;
  readonly requestNote?: string;
  readonly traceId?: string;
}

export interface MagicCraftResult {
  readonly success: boolean;
  readonly qualityLevel?: string | null;
  readonly resultDescription?: string | null;
  readonly failureReason?: string | null;
  readonly craftLog?: string | null;
}

const isMagicCraftPayload = (payload: unknown): payload is MagicCraftPayload => {
  if (!isRecord(payload)) {
    return false;
  }

  return (
    isNonEmptyString(payload.taskId) &&
    isNonEmptyString(payload.itemName) &&
    isNonEmptyString(payload.itemType) &&
    typeof payload.materialLevel === 'number' &&
    payload.materialLevel >= 1 &&
    payload.materialLevel <= 5 &&
    isOptionalNonEmptyString(payload.requestNote) &&
    isOptionalNonEmptyString(payload.traceId)
  );
};

export const MAGIC_CRAFT_JOB_CONTRACT = {
  [BULLMQ_JOBS.MAGIC_CRAFT.CRAFT]: {
    payload: {} as MagicCraftPayload,
    result: {} as MagicCraftResult,
    payloadValidator: isMagicCraftPayload,
  },
} as const;

export const MAGIC_CRAFT_QUEUE_CONTRACT = {
  queueName: BULLMQ_QUEUES.MAGIC_CRAFT,
  jobs: MAGIC_CRAFT_JOB_CONTRACT,
} as const;
