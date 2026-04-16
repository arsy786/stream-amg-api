import { randomUUID } from 'crypto';
import { EventEmitter } from 'events';
import { AssetStatus, CreateAssetInput, MediaAsset } from '../models/asset.model';

export const ASSET_EVENTS = {
  CREATED: 'assetCreated',
} as const;

export class AssetService extends EventEmitter {
  private readonly store = new Map<string, MediaAsset>();

  createAsset(data: CreateAssetInput): MediaAsset {
    const asset: MediaAsset = {
      ...data,
      id: randomUUID(),
      createdAt: new Date(),
    };

    this.store.set(asset.id, asset);
    this.emit(ASSET_EVENTS.CREATED, asset);

    return asset;
  }

  getAllAssets(status?: AssetStatus): MediaAsset[] {
    const all = Array.from(this.store.values());
    return status ? all.filter((a) => a.status === status) : all;
  }

  getAssetById(id: string): MediaAsset | undefined {
    return this.store.get(id);
  }
}
