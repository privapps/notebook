import { TestBed } from '@angular/core/testing';
import { Config } from './data_inteface';
import { NotebookLiteUrlConverterService } from './notebook-lite-url-converter.service';

describe('NotebookLiteUrlConverterService', () => {
  let converter: NotebookLiteUrlConverterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    converter = TestBed.inject(NotebookLiteUrlConverterService);
  });

  it('translates inline data without decrypting or changing the ciphertext or key', () => {
    const envelope = { v: 2, ct: 'ciphertext', adata: [null, 'plaintext', 0, 0], meta: { expire: '-1' } };
    const encoded = btoa(JSON.stringify(envelope)).replaceAll('/', '.');
    const url = `https://example.test/any-prefix#/notes/0/type,inline&symmetric,source-key&base64,${encoded}`;

    const converted = converter.convert(url, { app_root: '/' } as Config, 'https://example.test');
    const [key, payload] = converted.split('#')[1].split('@');

    expect(key).toBe('source-key');
    expect(decodeURIComponent(payload)).toBe(encoded);
  });

  it('translates remote shares into Notebook Lite key and URL format', () => {
    const sourceUrl = 'https://remote.example/api?pasteid=remote-id';
    const escaped = encodeURIComponent(sourceUrl.replace(/\//g, '___').replace(/\?/g, '---'));
    const url = `https://example.test/#/notes/0/type,remote&symmetric,source-key&url,${escaped}`;

    const converted = converter.convert(url, { app_root: '/' } as Config, 'https://example.test');
    const [key, resource] = converted.split('#')[1].split('@');

    expect(key).toBe('source-key');
    expect(decodeURIComponent(resource)).toBe(sourceUrl);
  });

  it('resolves relative remote storage URLs against the source Notebook Web deployment path', () => {
    const url = 'https://shared-notebook.example/notebook/index.html#/notes/0/type,remote&symmetric,source-key&url,data___peppa';

    const converted = converter.convert(url, { app_root: '/' } as Config, 'https://current-settings.example');

    expect(decodeURIComponent(converted.split('#')[1].split('@')[1]))
      .toBe('https://shared-notebook.example/notebook/data/peppa');
  });

  it('resolves configured PrivateBin and editable IDs without fetching their data', () => {
    const config = {
      app_root: '/',
      privatebin: { url: 'https://privatebin.example/api' },
      editable: { url: 'https://editable.example/get' }
    } as Config;
    const privatebin = converter.convert(
      'https://example.test/#/notes/0/type,pb&symmetric,pb-key&id,paste-1', config, 'https://example.test'
    );
    const editable = converter.convert(
      'https://example.test/#/notes/0/type,ed&symmetric,ed-key&id,paste-2', config, 'https://example.test'
    );

    expect(decodeURIComponent(privatebin.split('#')[1].split('@')[1]))
      .toBe('https://privatebin.example/api?pasteid=paste-1');
    expect(decodeURIComponent(editable.split('#')[1].split('@')[1]))
      .toBe('https://editable.example/get?pasteid=paste-2');
  });

  it('resolves relative configured endpoints against the app origin and preserves endpoint queries', () => {
    const config = {
      app_root: '/',
      privatebin: { url: '/index.php?format=json' },
      editable: { url: 'api/get?token=abc' }
    } as Config;
    const appOrigin = 'https://notebook-web.example';
    const privatebin = converter.convert(
      'https://shared-from-elsewhere.example/#/notes/0/type,pb&symmetric,pb-key&id,paste-1', config, appOrigin
    );
    const editable = converter.convert(
      'https://shared-from-elsewhere.example/#/notes/0/type,ed&symmetric,ed-key&id,paste-2', config, appOrigin
    );

    expect(decodeURIComponent(privatebin.split('#')[1].split('@')[1]))
      .toBe('https://notebook-web.example/index.php?format=json&pasteid=paste-1');
    expect(decodeURIComponent(editable.split('#')[1].split('@')[1]))
      .toBe('https://notebook-web.example/api/get?token=abc&pasteid=paste-2');
  });

  it('rejects malformed inline envelopes without attempting to decrypt them', () => {
    const url = 'https://example.test/#/notes/0/type,inline&symmetric,key&base64,bm90LWpzb24=';

    expect(() => converter.convert(url, { app_root: '/' } as Config, 'https://example.test'))
      .toThrowError(/The inline Notebook Web data is malformed:/);
  });

  it('reports unsupported storage routes and missing share parameters or configuration', () => {
    const config = { app_root: '/' } as Config;
    const cases: Array<[string, string]> = [
      ['https://example.test/#/notes/0/type,unknown&symmetric,key', 'Unsupported Notebook Web storage type: unknown.'],
      ['https://example.test/#/notes/0/type,inline&base64,e30=', 'missing its symmetric key'],
      ['https://example.test/#/notes/0/type,inline&symmetric,key', 'inline Notebook Web URL is missing its data'],
      ['https://example.test/#/notes/0/type,remote&symmetric,key', 'missing its PrivateBin address'],
      ['https://example.test/#/notes/0/type,pb&symmetric,key', 'missing its paste ID'],
      ['https://example.test/#/notes/0/type,pb&symmetric,key&id,id', 'PrivateBin is not configured'],
      ['https://example.test/#/notes/0/type,ed&symmetric,key&id,id', 'Editable storage is not configured']
    ];

    for (const [url, message] of cases) {
      expect(() => converter.convert(url, config, 'https://example.test')).toThrowError(message);
    }
  });
});
