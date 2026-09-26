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
      ['item6', 'directly in a shareable URL']
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
});
