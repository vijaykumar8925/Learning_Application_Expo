module.exports = {
  WHEN_UNLOCKED: 'WHEN_UNLOCKED',
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
};
