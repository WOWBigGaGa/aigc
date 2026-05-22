import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { WorkerModule } from '@src/bootstraps/worker/worker.module';
import { MagicWorkshopService } from '@src/modules/magic-workshop/magic-workshop.service';
import { MagicItemCraftTaskStatus, MagicItemQualityLevel } from '@src/modules/magic-workshop/entities/magic-item-craft-task.entity';
import { initGraphQLSchema } from '../../src/adapters/api/graphql/schema/schema.init';

jest.setTimeout(30000);

type MagicItemCraftTaskDto = {
  readonly id: string;
  readonly status: string;
  readonly qualityLevel: MagicItemQualityLevel | null;
  readonly resultDescription: string | null;
  readonly failureReason: string | null;
  readonly craftLog: string | null;
};

const CREATE_MAGIC_CRAFT_TASK_MUTATION = `
  mutation CreateMagicItemCraftTask($input: CreateMagicItemCraftTaskInput!) {
    createMagicItemCraftTask(input: $input) {
      id
      itemName
      itemType
      materialLevel
      requestNote
      status
      qualityLevel
      resultDescription
      failureReason
      craftLog
    }
  }
`;

const QUERY_MAGIC_CRAFT_TASK = `
  query MagicItemCraftTask($id: String!) {
    magicItemCraftTask(id: $id) {
      id
      status
      qualityLevel
      resultDescription
      failureReason
      craftLog
    }
  }
`;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const postGraphQL = (
  app: INestApplication,
  query: string,
  variables?: Record<string, unknown>,
) => {
  return request(app.getHttpServer()).post('/graphql').send({ query, variables });
};

const waitForTaskStatus = async (
  app: INestApplication,
  taskId: string,
  expectedStatus: MagicItemCraftTaskStatus,
  timeoutMs = 20000,
): Promise<MagicItemCraftTaskDto> => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const response = await postGraphQL(app, QUERY_MAGIC_CRAFT_TASK, { id: taskId }).expect(200);
    if (Array.isArray(response.body.errors) && response.body.errors.length > 0) {
      throw new Error(`GraphQL error when polling task: ${JSON.stringify(response.body.errors)}`);
    }

    const task = response.body.data?.magicItemCraftTask as MagicItemCraftTaskDto | null;
    if (task?.status === expectedStatus) {
      return task;
    }

    await sleep(500);
  }

  throw new Error(`Task ${taskId} did not reach status ${expectedStatus} within ${timeoutMs}ms`);
};

describe('Magic Workshop E2E', () => {
  let app: INestApplication;
  let service: MagicWorkshopService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [ApiModule, WorkerModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    initGraphQLSchema();
    await app.init();

    service = app.get(MagicWorkshopService);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should create a craft task and complete it through worker processing', async () => {
    const itemName = `火焰戒指-${Date.now()}`;
    const response = await postGraphQL(app, CREATE_MAGIC_CRAFT_TASK_MUTATION, {
      input: {
        itemName,
        itemType: 'WEAPON',
        materialLevel: 4,
        requestNote: '请优先打造高品质',
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    const created = response.body.data?.createMagicItemCraftTask;
    expect(created).toBeDefined();
    expect(created.status).toBe(MagicItemCraftTaskStatus.PENDING);
    expect(created.qualityLevel).toBeNull();
    expect(created.craftLog).toBeNull();

    const task = await waitForTaskStatus(app, created.id, MagicItemCraftTaskStatus.SUCCEEDED);
    expect(task.qualityLevel).toBeDefined();
    expect(task.resultDescription).toContain(itemName);
    expect(task.failureReason).toBeNull();
    expect(task.craftLog).toContain('加工完成');
  });

  it('should fail GraphQL validation for invalid enum input', async () => {
    const response = await postGraphQL(app, CREATE_MAGIC_CRAFT_TASK_MUTATION, {
      input: {
        itemName: '禁忌法杖',
        itemType: 'INVALID_TYPE',
        materialLevel: 3,
      },
    }).expect(200);

    expect(response.body.data).toBeNull();
    expect(Array.isArray(response.body.errors)).toBe(true);
    expect(response.body.errors[0].message).toMatch(/MagicItemType|Expected type MagicItemType|Unknown value/);
  });

  it('should transition task to FAILED when worker processing encounters an internal failure', async () => {
    const itemName = `破损法珠-${Date.now()}`;
    const completeSpy = jest
      .spyOn(service, 'completeMagicItemCraftTask')
      .mockImplementation(async () => {
        throw new Error('Mock worker failure');
      });

    const response = await postGraphQL(app, CREATE_MAGIC_CRAFT_TASK_MUTATION, {
      input: {
        itemName,
        itemType: 'TOY',
        materialLevel: 2,
        requestNote: '请强制失败',
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    const created = response.body.data?.createMagicItemCraftTask;
    expect(created).toBeDefined();
    expect(created.status).toBe(MagicItemCraftTaskStatus.PENDING);

    const failedTask = await waitForTaskStatus(app, created.id, MagicItemCraftTaskStatus.FAILED);
    expect(failedTask.failureReason).toContain('Mock worker failure');
    expect(failedTask.craftLog).toContain('加工失败');
    expect(failedTask.qualityLevel).toBeNull();

    completeSpy.mockRestore();
  });
});
