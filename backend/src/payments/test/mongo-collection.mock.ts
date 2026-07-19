/** Minimal Mongo collection mock for store unit tests. */

export function createMongoCollectionMock(
  overrides: Record<string, jest.Mock> = {},
) {
  return {
    createIndex: jest.fn().mockResolvedValue("ok"),
    findOne: jest.fn().mockResolvedValue(null),
    findOneAndUpdate: jest.fn().mockResolvedValue(null),
    insertOne: jest.fn().mockResolvedValue({ acknowledged: true }),
    updateMany: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
    ...overrides,
  };
}

export function createMongoDbServiceMock(collection: ReturnType<typeof createMongoCollectionMock>) {
  return {
    getDb: jest.fn().mockResolvedValue({
      collection: jest.fn().mockReturnValue(collection),
    }),
  };
}
