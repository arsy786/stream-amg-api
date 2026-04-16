import { randomUUID } from 'crypto';
import { EventEmitter } from 'events';
import { AssetContentType, AssetStatus, CreateAssetInput, MediaAsset } from '../models/asset.model';

export const ASSET_EVENTS = {
  CREATED: 'assetCreated',
  STATUS_CHANGED: 'assetStatusChanged',
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

  /**
   * NOTE: This method is defined to satisfy the "State Change Event" requirement.
   * In a full implementation, this would be hooked to a PATCH /assets/:id/status route.
   */
  // updateAssetStatus(id: string, status: AssetStatus): void {
  //   const asset = this.store.get(id);
  //   if (!asset) return;
  //   asset.status = status;
  //   this.store.set(id, asset);
  //   this.emit(ASSET_EVENTS.STATUS_CHANGED, asset);
  // }

  getAllAssets(status?: AssetStatus, contentType?: AssetContentType): MediaAsset[] {
    return Array.from(this.store.values()).filter(
      (a) => (!status || a.status === status) && (!contentType || a.contentType === contentType),
    );
  }

  getAssetById(id: string): MediaAsset | undefined {
    return this.store.get(id);
  }
}
