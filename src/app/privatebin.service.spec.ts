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

});
