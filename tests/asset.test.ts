import request from 'supertest';
import app from '../src/app';
import { assetService } from '../src/routes/asset.routes';
import { ASSET_EVENTS } from '../src/services/asset.service';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const validVod = { title: 'My VOD Asset', contentType: 'VOD', status: 'DRAFT' };
const validLive = {
  title: 'Live Stream',
  contentType: 'LIVE_EVENT',
  status: 'PUBLISHED',
  url: 'https://example.com/stream',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function createAsset(body: object) {
  return request(app).post('/assets').send(body);
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  assetService.clearStore();
});

// ---------------------------------------------------------------------------
// POST /assets
// ---------------------------------------------------------------------------

describe('POST /assets', () => {
  describe('success', () => {
    it('returns 201 with id and createdAt for a VOD asset', async () => {
      const res = await createAsset(validVod);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        title: validVod.title,
        contentType: validVod.contentType,
        status: validVod.status,
      });
      expect(res.body.id).toBeDefined();
      expect(typeof res.body.createdAt).toBe('string');
      expect(new Date(res.body.createdAt).toString()).not.toBe('Invalid Date');
    });

    it('returns 201 with an optional url included', async () => {
      const res = await createAsset(validLive);

      expect(res.status).toBe(201);
      expect(res.body.url).toBe(validLive.url);
    });
  });

  describe('validation failures', () => {

    it('returns 400 with "Title is required" when title is missing', async () => {
      const res = await createAsset({ contentType: 'VOD', status: 'DRAFT' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details.title).toContain('Invalid input: expected string, received undefined');
    });

    it('returns 400 with "Title is required" when title is an empty string', async () => {
      const res = await createAsset({ title: '', contentType: 'VOD', status: 'DRAFT' });

      expect(res.status).toBe(400);
      expect(res.body.details.title).toContain('Title is required');
    });

    it('returns 400 when status is an invalid enum value', async () => {
      const res = await createAsset({ title: 'Test', contentType: 'VOD', status: 'WAITING' });

      expect(res.status).toBe(400);
      expect(res.body.details.status).toBeDefined();
    });

    it('returns 400 when contentType is an invalid enum value', async () => {
      const res = await createAsset({ title: 'Test', contentType: 'PODCAST', status: 'DRAFT' });

      expect(res.status).toBe(400);
      expect(res.body.details.contentType).toBeDefined();
    });

    it('returns 400 when url is not a valid URL', async () => {
      const res = await createAsset({
        title: 'Test',
        contentType: 'VOD',
        status: 'DRAFT',
        url: 'not-a-url',
      });

      expect(res.status).toBe(400);
      expect(res.body.details.url).toBeDefined();
    });
  });
});

// ---------------------------------------------------------------------------
// GET /assets
// ---------------------------------------------------------------------------

describe('GET /assets', () => {
  it('returns all assets when no filters are applied', async () => {
    await createAsset(validVod);
    await createAsset(validLive);

    const res = await request(app).get('/assets');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('filters assets by status', async () => {
    await createAsset(validVod);   // DRAFT
    await createAsset(validLive);  // PUBLISHED

    const res = await request(app).get('/assets?status=PUBLISHED');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].status).toBe('PUBLISHED');
  });

  it('filters assets by contentType', async () => {
    await createAsset(validVod);   // VOD
    await createAsset(validLive);  // LIVE_EVENT

    const res = await request(app).get('/assets?contentType=VOD');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].contentType).toBe('VOD');
  });

  it('filters by status AND contentType simultaneously', async () => {
    await createAsset({ title: 'VOD Draft', contentType: 'VOD', status: 'DRAFT' });
    await createAsset({ title: 'Live Published', contentType: 'LIVE_EVENT', status: 'PUBLISHED' });
    await createAsset({ title: 'VOD Published', contentType: 'VOD', status: 'PUBLISHED' });

    const res = await request(app).get('/assets?status=PUBLISHED&contentType=VOD');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('VOD Published');
  });

  it('returns an empty array when no assets match the filter', async () => {
    await createAsset(validVod); // DRAFT

    const res = await request(app).get('/assets?status=PUBLISHED');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  it('returns 400 for an invalid status filter value', async () => {
    const res = await request(app).get('/assets?status=WAITING');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid status value');
    expect(Array.isArray(res.body.valid)).toBe(true);
  });

  it('returns 400 for an invalid contentType filter value', async () => {
    const res = await request(app).get('/assets?contentType=PODCAST');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid contentType value');
    expect(Array.isArray(res.body.valid)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// GET /assets/:id
// ---------------------------------------------------------------------------

describe('GET /assets/:id', () => {
  it('returns the asset matching the given id', async () => {
    const createRes = await createAsset(validVod);
    const { id } = createRes.body;

    const res = await request(app).get(`/assets/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body.title).toBe(validVod.title);
  });

  it('returns 404 for an unknown id', async () => {
    const res = await request(app).get('/assets/00000000-0000-0000-0000-000000000000');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Asset not found' });
  });
});

// ---------------------------------------------------------------------------
// Event: assetCreated
// ---------------------------------------------------------------------------

describe('Event: assetCreated', () => {
  it('emits assetCreated with the new asset payload after POST /assets', async () => {
    const spy = jest.spyOn(assetService, 'emit');

    const res = await createAsset(validVod);

    expect(spy).toHaveBeenCalledWith(
      ASSET_EVENTS.CREATED,
      expect.objectContaining({ id: res.body.id, title: validVod.title }),
    );

    spy.mockRestore();
  });
});
