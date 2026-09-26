import { MD5, SHA256 } from 'crypto-es';

describe('crypto-es compatibility', () => {
  it('preserves the existing MD5 and SHA-256 digest outputs', () => {
    expect(MD5('message').toString()).toBe('78e731027d8fd50ed642340b7c9a63b3');
    expect(SHA256('messagepwd').toString()).toBe('69207a6de06bf6da4afeb8f6f36b3cb241dff96422d17f746850aa57eda32223');
  });
});
