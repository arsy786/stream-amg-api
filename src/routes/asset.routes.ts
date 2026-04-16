import { Router } from 'express';
import { AssetController } from '../controllers/asset.controller';
import { validate } from '../middleware/validation.middleware';
import { CreateAssetSchema } from '../models/asset.model';
import { AssetService } from '../services/asset.service';

const router = Router();

export const assetService = new AssetService();
const assetController = new AssetController(assetService);

router.post('/', validate(CreateAssetSchema), assetController.createAsset);
router.get('/', assetController.getAllAssets);
router.get('/:id', assetController.getAssetById);

export default router;
