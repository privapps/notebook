import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import {
  NgxBootstrapIconsModule, questionCircle, tree, keyFill, arrowClockwise, book, fileEarmark,
  fileEarmarkArrowUpFill, clockFill, cloud, cloudFill, exclamationCircleFill, pencilFill,
  trashFill, caretUpFill, caretDownFill, fileEarmarkPlusFill
} from 'ngx-bootstrap-icons';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { BackboneService } from '../backbone.service';
import { LegacyService } from '../legacy.service';
import { SettingsComponent } from './settings.component';
import { Config } from '../data_inteface';

describe('Settings accordion', () => {
  let httpController: HttpTestingController;
  let service: {
    notes: { name: string; content: string; date: Date }[];
    metadata: { name: string; description: string };
    config: Config;
    parameters: { type: string };
    initial_loaded: boolean;
    new_initial: boolean;
    new_register: boolean;
    selectedSettingIndex: number;
    setSelectedSettingIndex(index: number): void;
    getSelectedSettingIndex(): number;
    wait_till_ready(): Promise<void>;
    new_symmetric_key(): string;
    get_encrypted_data(e2eKey: string, symmetricKey: string): Promise<unknown>;
  };

  beforeEach(async () => {
    service = {
      notes: [{ name: 'Sample', content: 'Notebook content', date: new Date('2026-01-01') }],
      metadata: { name: 'Notebook', description: '' },
      config: { app_root: '/' },
      parameters: { type: '' },
      initial_loaded: true,
      new_initial: false,
      new_register: false,
      selectedSettingIndex: 0,
      setSelectedSettingIndex(index: number) {
        this.selectedSettingIndex = index;
      },
      getSelectedSettingIndex() {
        return this.selectedSettingIndex;
      },
      new_symmetric_key() {
        return 'test-key';
      },
      get_encrypted_data() {
        return Promise.resolve({
          v: 2,
          ct: 'test-ciphertext',
          adata: [null, 'plaintext', 0, 0],
          meta: { expire: '-1' }
        });
      },
      wait_till_ready: async () => undefined
    };

    await TestBed.configureTestingModule({
      imports: [
        SettingsComponent,
        NgxBootstrapIconsModule.pick({
          questionCircle, tree, keyFill, arrowClockwise, book, fileEarmark, fileEarmarkArrowUpFill, clockFill,
          cloud, cloudFill, exclamationCircleFill, pencilFill, trashFill, caretUpFill, caretDownFill, fileEarmarkPlusFill
        }),
        HttpClientTestingModule,
        MarkdownModule.forRoot({ loader: HttpClient })
      ],
      providers: [
        { provide: BackboneService, useValue: service },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({}) },
            paramMap: of(convertToParamMap({}))
          }
        },
        {
          provide: LegacyService,
          useValue: { isOldBrowser: () => false, isSecureContext: () => true }
        }
      ]
    }).compileComponents();

    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpController.verify());

  async function createSettingsFixture(): Promise<ComponentFixture<SettingsComponent>> {
    const fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();
    httpController.expectOne('./assets/css/settings-help.md').flush('# About');
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();
    return fixture;
  }

  function selectSection(fixture: ComponentFixture<SettingsComponent>, id: string): void {
    const label = fixture.nativeElement.querySelector(`label[for="${id}"]`) as HTMLLabelElement;
    label.click();
    fixture.detectChanges();
  }

  it('opens About initially and keeps only the selected section open', async () => {
    const fixture = await createSettingsFixture();
    const checked = (id: string) =>
      (fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement).checked;

    expect(checked('item1')).toBe(true);
    expect(checked('item3')).toBe(false);
    expect(checked('item4')).toBe(false);
    expect(checked('item5')).toBe(false);
    expect(checked('item6')).toBe(false);
    const aboutLabel = fixture.nativeElement.querySelector('label[for="item1"]') as HTMLLabelElement;
    const createLabel = fixture.nativeElement.querySelector('label[for="item3"]') as HTMLLabelElement;
    const expandedBackground = window.getComputedStyle(aboutLabel).backgroundColor;
    const collapsedBackground = window.getComputedStyle(createLabel).backgroundColor;
    expect(expandedBackground).not.toBe(collapsedBackground);
    expect(window.getComputedStyle(aboutLabel).color).not.toBe(window.getComputedStyle(createLabel).color);

    const settingsContent = fixture.nativeElement.querySelector('.settings-help') as HTMLElement;
    expect(window.getComputedStyle(settingsContent).maxWidth).not.toBe('68ch');

    selectSection(fixture, 'item3');
    expect(checked('item1')).toBe(false);
    expect(checked('item3')).toBe(true);

    selectSection(fixture, 'item4');
    expect(checked('item3')).toBe(false);
    expect(checked('item4')).toBe(true);

    selectSection(fixture, 'item1');
    expect(checked('item1')).toBe(true);
    expect(checked('item4')).toBe(false);
    fixture.destroy();
  });

  it('generates both share formats from one encrypted snapshot', async () => {
    const fixture = await createSettingsFixture();
    selectSection(fixture, 'item6');
    const section = (fixture.nativeElement.querySelector('#item6') as HTMLInputElement)
      .closest('.custom-item') as HTMLElement;
    const key = vi.spyOn(service, 'new_symmetric_key').mockReturnValue('generated-key');
    const encryptedData = {
      v: 2,
      ct: 'ciphertext-for-both-links',
      adata: [null, 'plaintext', 0, 0],
      meta: { expire: '-1' }
    };
    const encrypt = vi.spyOn(service, 'get_encrypted_data').mockResolvedValue(encryptedData);

    expect(section.querySelectorAll('input[readonly]')).toHaveLength(2);
    expect(section.querySelectorAll('button[aria-label="Generate both share URLs"]')).toHaveLength(1);
    expect(section.querySelector('.section-description')?.textContent)
      .toContain('a compact, read-only Notebook Lite URL from the same snapshot');
    expect(section.querySelector('label[for="inlineurl"]')?.textContent?.trim()).toBe('Notebook Web:');
    expect(section.querySelector('label[for="notebookLiteUrl"]')?.textContent?.trim()).toBe('Read-only URL:');

    const generate = section.querySelector('button[aria-label="Generate both share URLs"]') as HTMLButtonElement;
    expect(generate.title).toBe('Generate both URLs');
    expect(generate.textContent?.trim()).toBe('');
    expect(generate.querySelector('svg.bi-arrow-clockwise')).not.toBeNull();
    generate.click();
    await fixture.whenStable();
    fixture.detectChanges();

    const notebookWebUrl = (section.querySelector('#inlineurl') as HTMLInputElement).value;
    const notebookLiteUrl = (section.querySelector('#notebookLiteUrl') as HTMLInputElement).value;
    const webPayload = notebookWebUrl.split('&base64,')[1];
    const litePayload = notebookLiteUrl.split('@')[1];

    expect(key).toHaveBeenCalledTimes(1);
    expect(encrypt).toHaveBeenCalledTimes(1);
    expect(encrypt).toHaveBeenCalledWith('', 'generated-key');
    expect(notebookWebUrl).toBe(
      `${window.location.origin}${window.location.pathname}#/notes/0/type,inline&symmetric,generated-key&base64,${webPayload}`
    );
    expect(notebookLiteUrl).toBe(`https://privapps.github.io/Notebook-lite/#generated-key@${litePayload}`);
    expect(litePayload).toBe(webPayload);
    expect(JSON.parse(atob(litePayload.replaceAll('.', '/')))).toEqual(encryptedData);
    const webOutput = section.querySelector('#inlineurl') as HTMLInputElement;
    const liteOutput = section.querySelector('#notebookLiteUrl') as HTMLInputElement;
    expect(webOutput.readOnly).toBe(true);
    expect(liteOutput.readOnly).toBe(true);
    webOutput.click();
    expect(webOutput.selectionStart).toBe(0);
    expect(webOutput.selectionEnd).toBe(webOutput.value.length);
    liteOutput.click();
    expect(liteOutput.selectionStart).toBe(0);
    expect(liteOutput.selectionEnd).toBe(liteOutput.value.length);
    fixture.destroy();
  });

  it('regenerates both URLs from the edited notebook with one fresh key per action', async () => {
    const fixture = await createSettingsFixture();
    selectSection(fixture, 'item6');
    fixture.componentInstance.e2e_key = 'share-password';
    const section = (fixture.nativeElement.querySelector('#item6') as HTMLInputElement)
      .closest('.custom-item') as HTMLElement;
    const key = vi.spyOn(service, 'new_symmetric_key')
      .mockReturnValueOnce('first-key')
      .mockReturnValueOnce('second-key');
    const encrypt = vi.spyOn(service, 'get_encrypted_data').mockImplementation(async (_password, symmetricKey) => ({
      v: 2,
      ct: `${symmetricKey}:${service.notes[0].content}`,
      adata: [null, 'plaintext', 0, 0],
      meta: { expire: '-1' }
    }));
    const generate = section.querySelector('button[aria-label="Generate both share URLs"]') as HTMLButtonElement;

    generate.click();
    await fixture.whenStable();
    fixture.detectChanges();
    const firstWebUrl = (section.querySelector('#inlineurl') as HTMLInputElement).value;
    const firstLiteUrl = (section.querySelector('#notebookLiteUrl') as HTMLInputElement).value;

    service.notes[0].content = 'edited notebook content';
    generate.click();
    await fixture.whenStable();
    fixture.detectChanges();
    const secondWebUrl = (section.querySelector('#inlineurl') as HTMLInputElement).value;
    const secondLiteUrl = (section.querySelector('#notebookLiteUrl') as HTMLInputElement).value;
    const secondPayload = secondLiteUrl.split('@')[1];

    expect(key).toHaveBeenCalledTimes(2);
    expect(encrypt).toHaveBeenNthCalledWith(1, 'share-password', 'first-key');
    expect(encrypt).toHaveBeenNthCalledWith(2, 'share-password', 'second-key');
    expect(firstWebUrl).not.toBe(secondWebUrl);
    expect(firstLiteUrl).not.toBe(secondLiteUrl);
    expect(secondPayload).toBe(secondWebUrl.split('&base64,')[1]);
    expect(JSON.parse(atob(secondPayload.replaceAll('.', '/'))).ct)
      .toBe('second-key:edited notebook content');
    fixture.destroy();
  });

  it('surfaces encryption failures and preserves both previously generated URLs', async () => {
    const fixture = await createSettingsFixture();
    selectSection(fixture, 'item6');
    const section = (fixture.nativeElement.querySelector('#item6') as HTMLInputElement)
      .closest('.custom-item') as HTMLElement;
    const key = vi.spyOn(service, 'new_symmetric_key')
      .mockReturnValueOnce('first-key')
      .mockReturnValueOnce('retry-key');
    const encrypt = vi.spyOn(service, 'get_encrypted_data')
      .mockResolvedValueOnce({ v: 2, ct: 'valid-snapshot', adata: [null, 'plaintext', 0, 0] })
      .mockRejectedValueOnce(new Error('encryption unavailable'));
    const generate = section.querySelector('button[aria-label="Generate both share URLs"]') as HTMLButtonElement;

    generate.click();
    await fixture.whenStable();
    fixture.detectChanges();
    const webOutput = section.querySelector('#inlineurl') as HTMLInputElement;
    const liteOutput = section.querySelector('#notebookLiteUrl') as HTMLInputElement;
    const previousWebUrl = webOutput.value;
    const previousLiteUrl = liteOutput.value;

    generate.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(key).toHaveBeenCalledTimes(2);
    expect(encrypt).toHaveBeenCalledTimes(2);
    expect(webOutput.value).toBe(previousWebUrl);
    expect(liteOutput.value).toBe(previousLiteUrl);
    expect(fixture.nativeElement.querySelector('.alert-danger')?.textContent)
      .toContain('Failed to generate share URLs: encryption unavailable');
    fixture.destroy();
  });

  it('preserves the selected section when the Settings view is recreated', async () => {
    const firstFixture = await createSettingsFixture();
    selectSection(firstFixture, 'item4');
    firstFixture.destroy();

    const nextFixture = await createSettingsFixture();
    expect((nextFixture.nativeElement.querySelector('#item4') as HTMLInputElement).checked).toBe(true);
    expect((nextFixture.nativeElement.querySelector('#item1') as HTMLInputElement).checked).toBe(false);
    nextFixture.destroy();
  });

  it('prepares the notebook text when PrivateBin is selected', async () => {
    const fixture = await createSettingsFixture();
    selectSection(fixture, 'item5');

    expect(service.getSelectedSettingIndex()).toBe(4);
    expect(fixture.componentInstance.plain_text_full_data).toContain('Notebook content');
    fixture.destroy();
  });

  it('explains every available notebook option inside its section', async () => {
    service.config.editable = { url: '/editable' };
    service.config.privatebin = { url: '/privatebin' };
    const fixture = await createSettingsFixture();
    const descriptions = [
      ['item1', 'how to save or share your notes'],
      ['item2', 'update the hosted copy'],
      ['item3', 'New notes are not saved automatically'],
      ['item4', 'not uploaded to a server'],
      ['item5', 'rather than updating an existing link'],
      ['item6', 'compact, read-only Notebook Lite URL from the same snapshot'],
      ['item7', 'Convert a Notebook Web share URL to Notebook Lite format']
    ];

    for (const [id, description] of descriptions) {
      if (!(fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement).checked) {
        selectSection(fixture, id);
      }
      const section = fixture.nativeElement.querySelector(`#${id}`).closest('.custom-item') as HTMLElement;
      expect(section.querySelector('.section-description')?.textContent).toContain(description);
      expect(window.getComputedStyle(section.querySelector('.custom-content')!).display).toBe('block');
    }
    fixture.destroy();
  });

  it('explains password and filename requirements for local file formats', async () => {
    const fixture = await createSettingsFixture();
    selectSection(fixture, 'item4');
    const section = fixture.nativeElement.querySelector('#item4').closest('.custom-item') as HTMLElement;
    expect(section.textContent).toContain('enter the same key in the E2E Key field before loading');

    for (const [tab, guidance] of [
      ['Legacy', 'Without an E2E key, this option saves plain text'],
      ['Save', 'Keep the file name unchanged']
    ]) {
      const link = Array.from(section.querySelectorAll<HTMLAnchorElement>('a')).find(a => a.textContent.trim() === tab)!;
      link.click();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(section.textContent).toContain(guidance);
    }
    fixture.destroy();
  });

  it('converts inline URLs in Settings without changing the open notebook state', async () => {
    const fixture = await createSettingsFixture();
    selectSection(fixture, 'item7');
    const component = fixture.componentInstance;
    const notesBefore = JSON.stringify(service.notes);
    const metadataBefore = JSON.stringify(service.metadata);
    const parametersBefore = JSON.stringify(service.parameters);
    component.e2e_key = 'editing-notes-password';
    const input = fixture.nativeElement.querySelector('#notebookLiteSourceUrl') as HTMLInputElement;
    const sourceUrl = makeInlineNotebookUrl('source-cipher');
    const sourcePayload = sourceUrl.split('&base64,')[1];
    input.value = sourceUrl;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    const button = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find((candidate: HTMLButtonElement) => candidate.textContent.includes('Convert to Notebook Lite')) as HTMLButtonElement;
    button.click();
    await fixture.whenStable();
    fixture.detectChanges();

    const output = fixture.nativeElement.querySelector('#notebookLiteConvertedUrl') as HTMLInputElement;
    expect(output.readOnly).toBe(true);
    output.click();
    expect(output.selectionStart).toBe(0);
    expect(output.selectionEnd).toBe(output.value.length);
    expect(output.value).toContain('https://privapps.github.io/Notebook-lite/#source-key@');
    expect(decodeURIComponent(output.value.split('@')[1])).toBe(sourcePayload);
    expect(JSON.stringify(service.notes)).toBe(notesBefore);
    expect(JSON.stringify(service.metadata)).toBe(metadataBefore);
    expect(JSON.stringify(service.parameters)).toBe(parametersBefore);
    expect(component.e2e_key).toBe('editing-notes-password');
    fixture.destroy();
  });

  it('translates remote, configured PrivateBin, and editable links without fetching their data', async () => {
    service.config.privatebin = { url: 'https://privatebin.example/api' };
    service.config.editable = { url: 'https://editable.example/get' };
    const fixture = await createSettingsFixture();
    selectSection(fixture, 'item7');
    const input = fixture.nativeElement.querySelector('#notebookLiteSourceUrl') as HTMLInputElement;
    const notesBefore = JSON.stringify(service.notes);
    const metadataBefore = JSON.stringify(service.metadata);
    const parametersBefore = JSON.stringify(service.parameters);
    const convertButton = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find((candidate: HTMLButtonElement) => candidate.textContent.includes('Convert to Notebook Lite')) as HTMLButtonElement;
    const cases = [
      {
        type: 'remote',
        url: makeShareUrl('remote', `url,${makeRemoteUrlParameter('https://remote.example/api?pasteid=remote-id')}`),
        targetUrl: 'https://remote.example/api?pasteid=remote-id'
      },
      {
        type: 'relative remote',
        url: makeShareUrl('remote', 'url,data___peppa'),
        targetUrl: 'https://privapps.github.io/notebook/data/peppa'
      },
      {
        type: 'pb',
        url: makeShareUrl('pb', 'id,private-id'),
        targetUrl: 'https://privatebin.example/api?pasteid=private-id'
      },
      {
        type: 'ed',
        url: makeShareUrl('ed', 'id,editable-id'),
        targetUrl: 'https://editable.example/get?pasteid=editable-id'
      }
    ];

    for (const testCase of cases) {
      input.value = testCase.url;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      fixture.detectChanges();
      convertButton.click();
      await fixture.whenStable();
      fixture.detectChanges();
      const output = (fixture.nativeElement.querySelector('#notebookLiteConvertedUrl') as HTMLInputElement).value;
      expect(output).toContain('https://privapps.github.io/Notebook-lite/#source-key@');
      expect(decodeURIComponent(output.split('@')[1])).toBe(testCase.targetUrl);
    }

    expect(JSON.stringify(service.notes)).toBe(notesBefore);
    expect(JSON.stringify(service.metadata)).toBe(metadataBefore);
    expect(JSON.stringify(service.parameters)).toBe(parametersBefore);
    fixture.destroy();
  });

  it('resolves a relative configured PrivateBin endpoint against this Notebook Web origin', async () => {
    service.config.privatebin = { url: '/index.php?format=json' };
    const fixture = await createSettingsFixture();
    selectSection(fixture, 'item7');
    const input = fixture.nativeElement.querySelector('#notebookLiteSourceUrl') as HTMLInputElement;
    input.value = makeShareUrl('pb', 'id,paste-42');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    const button = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find((candidate: HTMLButtonElement) => candidate.textContent.includes('Convert to Notebook Lite')) as HTMLButtonElement;
    button.click();
    await fixture.whenStable();
    fixture.detectChanges();

    const output = fixture.nativeElement.querySelector('#notebookLiteConvertedUrl') as HTMLInputElement;
    expect(decodeURIComponent(output.value.split('@')[1]))
      .toBe(`${window.location.origin}/index.php?format=json&pasteid=paste-42`);
    fixture.destroy();
  });

  it('does not request an E2E password while translating a protected source link', async () => {
    const fixture = await createSettingsFixture();
    selectSection(fixture, 'item7');
    fixture.componentInstance.e2e_key = 'editing-notes-password';
    const input = fixture.nativeElement.querySelector('#notebookLiteSourceUrl') as HTMLInputElement;
    input.value = makeInlineNotebookUrl('password-protected');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    const button = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find((candidate: HTMLButtonElement) => candidate.textContent.includes('Convert to Notebook Lite')) as HTMLButtonElement;
    button.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.e2e_key).toBe('editing-notes-password');
    expect(fixture.nativeElement.querySelector('#converterE2eKey')).toBeNull();
    fixture.destroy();
  });

  it('keeps the previous output and reports conversion failures', async () => {
    const fixture = await createSettingsFixture();
    selectSection(fixture, 'item7');
    const input = fixture.nativeElement.querySelector('#notebookLiteSourceUrl') as HTMLInputElement;
    const button = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find((candidate: HTMLButtonElement) => candidate.textContent.includes('Convert to Notebook Lite')) as HTMLButtonElement;
    input.value = makeInlineNotebookUrl('source-cipher');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    button.click();
    await fixture.whenStable();
    fixture.detectChanges();
    const output = fixture.nativeElement.querySelector('#notebookLiteConvertedUrl') as HTMLInputElement;
    const previousOutput = output.value;

    input.value = 'https://example.com/not-a-notebook-link';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    button.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(output.value).toBe(previousOutput);
    expect(fixture.nativeElement.querySelector('#notebookLiteConversionMessage')?.textContent)
      .toContain('The URL does not contain a Notebook Web notes share route.');

    input.value = 'https://example.com/#/notes/0/type,inline&symmetric,key&base64,bm90LWpzb24=';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    button.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(output.value).toBe(previousOutput);
    expect(fixture.nativeElement.querySelector('#notebookLiteConversionMessage')?.textContent)
      .toContain('The inline Notebook Web data is malformed:');

    input.value = makeShareUrl('pb', 'id,missing-id');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    button.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(output.value).toBe(previousOutput);
    expect(fixture.nativeElement.querySelector('#notebookLiteConversionMessage')?.textContent)
      .toContain('PrivateBin is not configured for this Notebook Web deployment.');
    fixture.destroy();
  });

  function makeShareUrl(type: string, extra: string): string {
    return `https://privapps.github.io/notebook/#/notes/0/type,${type}&symmetric,source-key&${extra}`;
  }

  function makeRemoteUrlParameter(remoteUrl: string): string {
    const escaped = remoteUrl.replace(/\//g, '___').replace(/\?/g, '---');
    return encodeURIComponent(escaped);
  }

  function makeInlineNotebookUrl(ciphertext: string): string {
    const payload = btoa(JSON.stringify({
      v: 2,
      ct: ciphertext,
      adata: [null, 'plaintext', 0, 0],
      meta: { expire: '-1' }
    })).replaceAll('/', '.');
    return `https://privapps.github.io/notebook/index.html#/notes/0/type,inline&symmetric,source-key&base64,${payload}`;
  }
});
