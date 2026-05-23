export enum MagicItemType {
  WEAPON = 'WEAPON',
  ARMOR = 'ARMOR',
  TOOL = 'TOOL',
  TOY = 'TOY',
}

export enum MagicItemCraftTaskStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
}

export enum MagicItemQualityLevel {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

export interface MagicItemCraftTask {
  id: string;
  itemName: string;
  itemType: MagicItemType;
  materialLevel: number;
  requestNote: string | null;
  status: MagicItemCraftTaskStatus;
  qualityLevel: MagicItemQualityLevel | null;
  resultDescription: string | null;
  failureReason: string | null;
  craftLog: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMagicItemCraftTaskInput {
  itemName: string;
  itemType: MagicItemType;
  materialLevel: number;
  requestNote?: string;
}
