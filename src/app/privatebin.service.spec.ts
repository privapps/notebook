import { TestBed } from '@angular/core/testing';

import { PrivatebinService } from './privatebin.service';

describe('PrivatebinService', () => {
  let service: PrivatebinService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrivatebinService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should be en/de crypted', async () => {
    let msg = 'message', pwd = 'pwd'
    const symmetricKey = service.getSymmetricKey()
    const p = service.cipher(msg, symmetricKey,pwd)
    let cipher_data = await p;
    let text = await service.decipher(cipher_data,symmetricKey, pwd, () => Promise.resolve(''), 1)
      expect(text).toEqual(msg)
  })
  it('should be en/de coded', async () => {
    const symmetricKey = service.getSymmetricKey()
    const data = JSON.stringify([service.key_to_base58(symmetricKey)])
    // decode
    const de_data = JSON.parse(data)
    const out_key = service.key_from_base58(de_data[0])
    expect(out_key).toEqual(symmetricKey)

  })

  it('should preserve the PrivateBin envelope and base58 key contract', async () => {
    const symmetricKey = service.getSymmetricKey()
    const encodedKey = service.key_to_base58(symmetricKey)
    const envelope = await service.cipher_privatebin_data('message', symmetricKey, 'pwd', '1day')

    expect(envelope.v).toEqual(2)
    expect(envelope.meta).toEqual({ expire: '1day' })
    expect(envelope.ct).toEqual(expect.any(String))
    expect(envelope.adata).toEqual(expect.any(Array))
    expect(envelope.adata.length).toBe(4)
    expect(envelope.adata[0].length).toBe(8)
    expect(envelope.adata[0].slice(2)).toEqual([100000, 256, 128, 'aes', 'gcm', 'zlib'])
    expect(envelope.adata.slice(1)).toEqual(['plaintext', 0, 0])
    await expect(
      service.decipher_privatebin_data(envelope, encodedKey, 'pwd', () => Promise.resolve(''))
    ).resolves.toBe('message')
  })

  it('should preserve legacy and current local encrypted-file payloads', async () => {
    const payload = JSON.stringify([
      [{ name: 'Encrypted note', content: 'private content', date: '2026-01-01' }],
      { name: 'Notebook', description: 'Compatibility fixture' }
    ])
    const password = 'pwd'
    const symmetricKey = service.getSymmetricKey()
    const encodedKey = service.key_to_base58(symmetricKey)
    const cipher = await service.cipher(payload, symmetricKey, password)

    const legacyFile = JSON.stringify([cipher, encodedKey])
    const [legacyCipher, legacyKey] = JSON.parse(legacyFile)
    await expect(
      service.decipher(legacyCipher, service.key_from_base58(legacyKey), password, () => Promise.resolve(''), 0)
    ).resolves.toBe(payload)

    const currentFile = JSON.stringify(cipher)
    const currentCipher = JSON.parse(currentFile)
    await expect(
      service.decipher(currentCipher, service.key_from_base58(encodedKey), password, () => Promise.resolve(''), 0)
    ).resolves.toBe(payload)
  })

});
