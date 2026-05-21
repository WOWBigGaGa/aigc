export const AI_PROVIDER_CALL_RECORD_SOURCES = [
  'user_action',
  'admin_action',
  'system',
  'cron',
  'domain_event',
  'webhook',
] as const;

export type AiProviderCallRecordSource = (typeof AI_PROVIDER_CALL_RECORD_SOURCES)[number];

export const AI_PROVIDER_CALL_RECORD_PROVIDER_STATUSES = ['succeeded', 'failed'] as const;

export type AiProviderCallRecordProviderStatus =
  (typeof AI_PROVIDER_CALL_RECORD_PROVIDER_STATUSES)[number];
