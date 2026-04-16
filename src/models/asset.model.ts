import { z } from 'zod';

export const AssetStatus = z.enum(['DRAFT', 'PROCESSING', 'PUBLISHED', 'FAILED', 'UNPUBLISHED']);
export const AssetContentType = z.enum(['VOD', 'LIVE_EVENT', 'HIGHLIGHT']);

export type AssetStatus = z.infer<typeof AssetStatus>;
export type AssetContentType = z.infer<typeof AssetContentType>;

// Schema for validating the request body on asset creation.
// id and createdAt are server-assigned, so they are intentionally excluded.
export const CreateAssetSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  contentType: AssetContentType,
  status: AssetStatus,
  url: z.string().url().optional(),
});

export type CreateAssetInput = z.infer<typeof CreateAssetSchema>;

export interface MediaAsset extends CreateAssetInput {
  id: string;
  createdAt: Date;
}
