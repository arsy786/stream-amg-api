import { Request, Response } from 'express';
import { AssetContentType, AssetStatus } from '../models/asset.model';
import { ASSET_EVENTS, AssetService } from '../services/asset.service';

export class AssetController {
  constructor(private readonly assetService: AssetService) {
    // Close the event loop: log every created asset as an audit trail.
    this.assetService.on(ASSET_EVENTS.CREATED, (asset) => {
      console.log(`[event:assetCreated] id=${asset.id} title="${asset.title}"`);
    });
  }

  createAsset = (req: Request, res: Response): void => {
    const asset = this.assetService.createAsset(req.body);
    res.status(201).json(asset);
  };

  getAssetById = (req: Request, res: Response): void => {
    const asset = this.assetService.getAssetById(req.params.id as string);

    if (!asset) {
      res.status(404).json({ error: 'Asset not found' });
      return;
    }

    res.json(asset);
  };

  getAllAssets = (req: Request, res: Response): void => {
    const { status, contentType } = req.query;

    const parsedStatus = AssetStatus.safeParse(status);
    const parsedContentType = AssetContentType.safeParse(contentType);

    if (status !== undefined && !parsedStatus.success) {
      res.status(400).json({ error: 'Invalid status value', valid: AssetStatus.options });
      return;
    }

    if (contentType !== undefined && !parsedContentType.success) {
      res.status(400).json({ error: 'Invalid contentType value', valid: AssetContentType.options });
      return;
    }

    const assets = this.assetService.getAllAssets(
      parsedStatus.success ? parsedStatus.data : undefined,
      parsedContentType.success ? parsedContentType.data : undefined,
    );

    res.json(assets);
  };
}
