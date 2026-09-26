import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AppModule } from './app.module';
import { FulllistComponent } from './fulllist/fulllist.component';
import { NotesComponent } from './notes/notes.component';
import { BackboneService } from './backbone.service';
import { Note } from './data_inteface';

describe('Markdown note views', () => {
  let notes: Note[];
  let originalConfirm: typeof window.confirm;
  let service: {
    notes: Note[];
    metadata: { name: string; description: string };
    parameters: { type: string };
    is_editing: boolean;
    notes_ttl: number;
    wait_till_ready: () => Promise<void>;
    get_notes_url: () => string;
    get_extra_url: () => string;
    initial_blank: () => void;
    update_top_menu: () => void;
    is_content_changed: () => boolean;
    reset_parameters: () => void;
    note_position_up: (index: number, up: boolean) => void;
  };

  beforeEach(async () => {
    originalConfirm = window.confirm;
    notes = [
      { name: 'First note', content: '```js\nconst first = true;\n```', date: new Date('2026-01-01') },
      { name: 'Second note', content: '```python\ndef second(): pass\n```', date: new Date('2026-01-02') }
    ];
    service = {
      notes,
      metadata: { name: 'Notebook', description: '' },
      parameters: { type: '' },
      is_editing: true,
      notes_ttl: -1,
      wait_till_ready: async () => undefined,
      get_notes_url: () => window.location.href,
      get_extra_url: () => service.parameters.type === 'ed' ? 'type,ed&id,review' : '',
      initial_blank: () => undefined,
      update_top_menu: () => undefined,
      is_content_changed: () => false,
      reset_parameters: () => undefined,
      note_position_up: (index, up) => {
        const next = up ? index - 1 : index + 1;
        [notes[index], notes[next]] = [notes[next], notes[index]];
      }
    };

    await TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [{ provide: BackboneService, useValue: service }]
      }).compileComponents();
  });

  afterEach(() => {
    window.confirm = originalConfirm;
  });

  async function createNotesFixture(): Promise<ComponentFixture<NotesComponent>> {
    const fixture: ComponentFixture<NotesComponent> = TestBed.createComponent(NotesComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();
    return fixture;
  }

  it.each([
    { view: 'Notes', component: NotesComponent },
    { view: 'View All', component: FulllistComponent }
  ])('preserves leading code indentation in $view without rendering its HTML source', async ({ component }) => {
    service.is_editing = false;
    notes[0].content = '    <div>literal code</div>\n    print("hello")';
    const fixture = TestBed.createComponent<NotesComponent | FulllistComponent>(component);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();

    const markdown = fixture.nativeElement.querySelector('markdown');
    expect(markdown.querySelector('pre code')?.textContent.trim()).toBe('<div>literal code</div>\nprint("hello")');
    expect(markdown.querySelector('code div')).toBeNull();
    expect(notes[0].content).toBe('    <div>literal code</div>\n    print("hello")');

  });

  it.each([
    { view: 'Notes', component: NotesComponent },
    { view: 'View All', component: FulllistComponent }
  ])('sanitizes raw HTML in $view while preserving ordinary Markdown', async ({ component }) => {
    notes[0].content = '# Safe heading\n\n<img src="example.png" onerror="alert(1)">\n\n<script>alert(1)</script>';
    const fixture = TestBed.createComponent<NotesComponent | FulllistComponent>(component);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();

    const markdown = fixture.nativeElement.querySelector('markdown');
    expect(markdown.querySelector('h1')?.textContent).toBe('Safe heading');
    expect(markdown.querySelector('img')?.getAttribute('src')).toBe('example.png');
    expect(markdown.querySelector('img')?.hasAttribute('onerror')).toBe(false);
    expect(markdown.querySelector('script')).toBeNull();
  });

  it.each([
    { action: 'Move down', initialPage: 0, nextPage: 1 },
    { action: 'Move up', initialPage: 1, nextPage: 0 },
    { action: 'Delete', initialPage: 0, nextPage: 0 }
  ])('preserves the editable route and collapsed workspace after $action', async ({ action, initialPage, nextPage }) => {
    service.parameters.type = 'ed';
    window.confirm = () => true;
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl(`/notes/${initialPage}/type,ed&id,review`, NotesComponent);
    await harness.fixture.whenStable();
    harness.detectChanges();
    const root = harness.routeNativeElement!;
    (root.querySelector('.toggle-notes') as HTMLButtonElement).click();
    harness.detectChanges();
    const editor = root.querySelector('textarea');
    const preview = root.querySelector('markdown');
    expect((root.querySelector('#notes-sidebar') as HTMLElement).hidden).toBe(true);

    (root.querySelector(`button[title="${action}"]`) as HTMLButtonElement).click();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(harness.routeDebugElement?.componentInstance === component).toBe(true);
    expect(TestBed.inject(Router).url).toBe(`/notes/${nextPage}/type,ed&id,review`);
    expect(root.querySelector('textarea')).toBe(editor);
    expect(root.querySelector('markdown')).toBe(preview);

    if (action === 'Delete') {
      expect(notes).toHaveLength(1);
      (root.querySelector('button[title="Create"]') as HTMLButtonElement).click();
      await harness.fixture.whenStable();
      harness.detectChanges();
      expect(notes).toHaveLength(2);
      expect(TestBed.inject(Router).url).toBe('/notes/1/type,ed&id,review');
    } else {
      expect(notes.map(note => note.name)).toEqual(['Second note', 'First note']);
      expect(component.selected_id).toBe(nextPage);
      expect(component.selected_note).toBe(notes[nextPage]);
    }
    expect((root.querySelector('.toggle-notes') as HTMLButtonElement).textContent.trim()).toBe('Show sidebar');
    expect((root.querySelector('#notes-sidebar') as HTMLElement).hidden).toBe(true);
  });

  it('does not navigate or change the collapsed draft when deletion is canceled', async () => {
    service.parameters.type = 'ed';
    window.confirm = () => false;
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/notes/1/type,ed&id,review', NotesComponent);
    await harness.fixture.whenStable();
    harness.detectChanges();
    const root = harness.routeNativeElement!;
    (root.querySelector('.toggle-notes') as HTMLButtonElement).click();
    harness.detectChanges();
    (root.querySelector('button[title="Delete"]') as HTMLButtonElement).click();
    await harness.fixture.whenStable();
    harness.detectChanges();

    expect(notes).toHaveLength(2);
    expect(TestBed.inject(Router).url).toBe('/notes/1/type,ed&id,review');
    expect(component.selected_note).toBe(notes[1]);
    expect(harness.routeDebugElement?.componentInstance === component).toBe(true);
    expect((root.querySelector('#notes-sidebar') as HTMLElement).hidden).toBe(true);
  });

  it('renders and updates code labels and highlighting in the Notes view', async () => {
    const fixture: ComponentFixture<NotesComponent> = TestBed.createComponent(NotesComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();

    const markdown = fixture.nativeElement.querySelector('markdown.markdown-code-labels');
    expect(markdown.querySelector('.toolbar-item span')?.textContent).toBe('JavaScript');
    expect(markdown.querySelector('code .token.keyword')?.textContent).toBe('const');

    const editor = fixture.nativeElement.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    const notebookTitle = fixture.nativeElement.querySelector('.notebook-title-input') as HTMLInputElement;
    const notebookDescription = fixture.nativeElement.querySelector('.notebook-description-input') as HTMLInputElement;
    const noteName = fixture.nativeElement.querySelector('input[aria-label="Note name"]') as HTMLInputElement;
    const toggle = fixture.nativeElement.querySelector('.toggle-notes') as HTMLButtonElement;
    const sidebar = fixture.nativeElement.querySelector('#notes-sidebar') as HTMLElement;
    const selectedNote = fixture.componentInstance.selected_note;
    expect(toggle.textContent.trim()).toBe('Hide sidebar');
    expect(toggle.getAttribute('aria-controls')).toBe('notes-sidebar');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    const layoutHelp = fixture.nativeElement.querySelector('#editing-layout-help') as HTMLElement;
    expect(layoutHelp.textContent.replace(/\s+/g, ' ').trim()).toContain(
      'With the sidebar hidden on wide screens, the editor appears on the left and its preview is on the right; with the sidebar shown or on narrow screens, they stack.'
    );

    notebookTitle.value = 'Notebook draft';
    notebookTitle.dispatchEvent(new Event('input', { bubbles: true }));
    notebookDescription.value = 'Description draft';
    notebookDescription.dispatchEvent(new Event('input', { bubbles: true }));
    noteName.value = 'First note draft';
    noteName.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    fixture.detectChanges();
    const beforeLayoutData = JSON.stringify([service.notes, service.metadata]);
    const originalUrl = window.location.href;

    toggle.focus();
    toggle.click();
    fixture.detectChanges();
    expect(document.activeElement).toBe(toggle);
    expect(toggle.textContent.trim()).toBe('Show sidebar');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(sidebar.hidden).toBe(true);
    expect(sidebar.getAttribute('aria-hidden')).toBe('true');
    expect(sidebar.hasAttribute('inert')).toBe(true);
    expect(fixture.nativeElement.querySelector('#notes-sidebar')).toBe(sidebar);
    expect(fixture.nativeElement.querySelector('textarea[name="content"]')).toBe(editor);
    expect(fixture.nativeElement.querySelector('markdown.markdown-code-labels')).toBe(markdown);
    expect(fixture.componentInstance.selected_note).toBe(selectedNote);
    expect(JSON.stringify([service.notes, service.metadata])).toBe(beforeLayoutData);
    expect(window.location.href).toBe(originalUrl);
    expect(fixture.nativeElement.querySelectorAll('.thread-control button')).toHaveLength(4);

    editor.value = '```python\ndef updated(): pass\n```';
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();
    expect(markdown.querySelector('.toolbar-item span')?.textContent).toBe('Python');
    expect(markdown.querySelector('code .token.keyword')?.textContent).toBe('def');
    const draftData = JSON.stringify([service.notes, service.metadata]);

    toggle.click();
    fixture.detectChanges();
    expect(toggle.textContent.trim()).toBe('Hide sidebar');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(sidebar.hidden).toBe(false);
    expect(sidebar.hasAttribute('inert')).toBe(false);
    toggle.click();
    fixture.detectChanges();
    expect(toggle.textContent.trim()).toBe('Show sidebar');
    toggle.click();
    fixture.detectChanges();
    expect(toggle.textContent.trim()).toBe('Hide sidebar');
    expect(editor.value).toContain('def updated');
    expect(fixture.nativeElement.querySelector('input[aria-label="Notebook title"]').value).toBe('Notebook draft');
    expect(fixture.nativeElement.querySelector('input[aria-label="Notebook description"]').value).toBe('Description draft');
    expect(fixture.nativeElement.querySelector('input[aria-label="Note name"]').value).toBe('First note draft');
    expect(JSON.stringify([service.notes, service.metadata])).toBe(draftData);
    expect(window.location.href).toBe(originalUrl);
    expect(markdown.querySelector('.toolbar-item span')?.textContent).toBe('Python');
    expect(markdown.querySelector('code .token.keyword')?.textContent).toBe('def');
    expect(markdown.querySelectorAll('.toolbar-item span')).toHaveLength(1);
  });

  it('resets the collapsed preference when leaving and reentering edit mode', async () => {
    const fixture: ComponentFixture<NotesComponent> = TestBed.createComponent(NotesComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();

    const toggle = fixture.nativeElement.querySelector('.toggle-notes') as HTMLButtonElement;
    const sidebar = fixture.nativeElement.querySelector('#notes-sidebar') as HTMLElement;
    const editMode = fixture.nativeElement.querySelector('#edit-mode') as HTMLInputElement;
    expect(editMode.checked).toBe(true);
    toggle.click();
    fixture.detectChanges();
    expect(sidebar.hidden).toBe(true);

    editMode.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.toggle-notes')).toBeNull();
    expect(fixture.nativeElement.querySelector('textarea[name="content"]')).toBeNull();
    expect(sidebar.hidden).toBe(false);
    expect(service.is_editing).toBe(false);

    editMode.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const restoredToggle = fixture.nativeElement.querySelector('.toggle-notes') as HTMLButtonElement;
    expect(restoredToggle.textContent.trim()).toBe('Hide sidebar');
    expect(restoredToggle.getAttribute('aria-expanded')).toBe('true');
    expect(sidebar.hidden).toBe(false);
    expect(service.is_editing).toBe(true);
  });

  it('uses single-note editing automatically and reveals navigation when a second note is created', async () => {
    notes.splice(1);
    service.is_editing = false;
    const fixture = await createNotesFixture();

    const workspace = fixture.nativeElement.querySelector('.editing-workspace') as HTMLElement;
    const editMode = fixture.nativeElement.querySelector('#edit-mode') as HTMLInputElement;
    expect(workspace.classList.contains('split')).toBe(false);
    expect(workspace.classList.contains('reading-view')).toBe(true);
    expect(fixture.nativeElement.querySelector('#notes-sidebar')).toBeNull();
    expect(fixture.nativeElement.querySelector('.toggle-notes')).toBeNull();
    expect(fixture.nativeElement.querySelector('textarea[name="content"]')).toBeNull();

    editMode.click();
    fixture.detectChanges();
    expect(workspace.classList.contains('split')).toBe(true);
    expect(workspace.classList.contains('reading-view')).toBe(false);
    expect(fixture.nativeElement.querySelector('textarea[name="content"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('#notes-sidebar')).toBeNull();
    expect(fixture.nativeElement.querySelector('.toggle-notes')).toBeNull();
    const singleNoteHelp = (fixture.nativeElement.querySelector('.editing-help') as HTMLElement).textContent.replace(/\s+/g, ' ').trim();
    expect(singleNoteHelp).toContain('Single-note notebooks split automatically on wide screens.');
    expect(singleNoteHelp).not.toContain('toggle navigation.');

    (fixture.nativeElement.querySelector('button[title="Create"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(notes).toHaveLength(2);
    expect(fixture.nativeElement.querySelector('#notes-sidebar')).not.toBeNull();
    expect((fixture.nativeElement.querySelector('.toggle-notes') as HTMLButtonElement).textContent.trim()).toBe('Hide sidebar');
    expect(workspace.classList.contains('split')).toBe(false);
    expect((fixture.nativeElement.querySelector('textarea[name="content"]') as HTMLTextAreaElement).value).toBe('');
    fixture.destroy();
  });

  it('uses the full available width for multi-note reading and All Notes content', async () => {
    service.is_editing = false;
    const fixture = await createNotesFixture();
    const readingContent = fixture.nativeElement.querySelector('.note-content') as HTMLElement;

    expect(fixture.nativeElement.querySelector('#notes-sidebar')).not.toBeNull();
    expect(window.getComputedStyle(readingContent).maxWidth).not.toBe('68ch');
    fixture.destroy();

    const allNotesFixture: ComponentFixture<FulllistComponent> = TestBed.createComponent(FulllistComponent);
    allNotesFixture.detectChanges();
    await allNotesFixture.whenStable();
    const allNotesContent = allNotesFixture.nativeElement.querySelector('.note-content') as HTMLElement;

    expect(window.getComputedStyle(allNotesContent).maxWidth).not.toBe('68ch');
    allNotesFixture.destroy();
  });

  it('preserves collapsed preference through note-count transitions and keeps note actions usable', async () => {
    window.confirm = () => true;
    const fixture = await createNotesFixture();
    const workspace = fixture.nativeElement.querySelector('.editing-workspace') as HTMLElement;
    const toggle = fixture.nativeElement.querySelector('.toggle-notes') as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('#notes-sidebar') as HTMLElement).hidden).toBe(true);
    expect(workspace.classList.contains('split')).toBe(true);

    const moveUp = () => fixture.nativeElement.querySelector('button[title="Move up"]') as HTMLButtonElement;
    const moveDown = () => fixture.nativeElement.querySelector('button[title="Move down"]') as HTMLButtonElement;
    expect(moveUp().disabled).toBe(true);
    expect(moveDown().disabled).toBe(false);
    moveDown().click();
    fixture.detectChanges();
    expect(notes.map(note => note.name)).toEqual(['Second note', 'First note']);
    expect(moveUp().disabled).toBe(false);
    expect(moveDown().disabled).toBe(true);
    moveUp().click();
    fixture.detectChanges();
    expect(notes.map(note => note.name)).toEqual(['First note', 'Second note']);
    expect(moveUp().disabled).toBe(true);

    (fixture.nativeElement.querySelector('button[title="Create"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(notes).toHaveLength(3);
    expect((fixture.nativeElement.querySelector('.toggle-notes') as HTMLButtonElement).textContent.trim()).toBe('Show sidebar');
    expect((fixture.nativeElement.querySelector('#notes-sidebar') as HTMLElement).hidden).toBe(true);
    expect(workspace.classList.contains('split')).toBe(true);

    (fixture.nativeElement.querySelector('button[title="Delete"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(notes.map(note => note.name)).toEqual(['First note', 'Second note']);
    expect(fixture.componentInstance.selected_id).toBe(1);
    (fixture.nativeElement.querySelector('button[title="Delete"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(notes).toHaveLength(1);
    expect(notes[0].name).toBe('First note');
    expect(notes[0].content).toContain('const first');
    expect(fixture.componentInstance.selected_id).toBe(0);
    expect(fixture.componentInstance.selected_note.name).toBe('First note');
    expect(fixture.nativeElement.querySelector('#notes-sidebar')).toBeNull();
    expect(fixture.nativeElement.querySelector('.toggle-notes')).toBeNull();
    expect(workspace.classList.contains('split')).toBe(true);

    (fixture.nativeElement.querySelector('button[title="Create"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(notes).toHaveLength(2);
    const restoredToggle = fixture.nativeElement.querySelector('.toggle-notes') as HTMLButtonElement;
    expect(restoredToggle.textContent.trim()).toBe('Show sidebar');
    expect((fixture.nativeElement.querySelector('#notes-sidebar') as HTMLElement).hidden).toBe(true);
    expect(workspace.classList.contains('split')).toBe(true);

    restoredToggle.click();
    fixture.detectChanges();
    const firstNoteLink = fixture.nativeElement.querySelector('#notes-sidebar .nav-link') as HTMLAnchorElement;
    firstNoteLink.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected_id).toBe(0);
    expect(fixture.componentInstance.selected_note.name).toBe('First note');
    expect((fixture.nativeElement.querySelector('textarea[name="content"]') as HTMLTextAreaElement).value).toContain('const first');

    (fixture.nativeElement.querySelector('.view-all') as HTMLButtonElement).click();
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();
    const modal = document.body.querySelector('ngb-modal-window') as HTMLElement;
    expect(modal).not.toBeNull();
    expect(modal.textContent).toContain('First note');
    expect(modal.textContent).toContain('New');
    expect(modal.querySelectorAll('article.note-card')).toHaveLength(2);
    expect(modal.querySelector('article.note-card .note-content markdown')).not.toBeNull();
    (modal.querySelector('button[aria-label="Close"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.destroy();
  });

  it('does not attempt to select a note when a single-note notebook has no navigation component', async () => {
    notes.splice(1);
    const fixture = await createNotesFixture();
    expect(() => fixture.componentInstance.move_note(true)).not.toThrow();
    expect(() => fixture.componentInstance.move_note(false)).not.toThrow();
    expect(fixture.componentInstance.selected_id).toBe(0);

    fixture.componentInstance.add_note();
    expect(notes).toHaveLength(2);
    expect(() => fixture.componentInstance.move_note(true)).not.toThrow();
    expect(notes.map(note => note.name)).toEqual(['New', 'First note']);
    fixture.destroy();
  });

  it('renders challenging Markdown content inside the editing workspace and removes its editing scope in view mode', async () => {
    const longWord = 'unbroken-content-'.repeat(24);
    const longCodeLine = `const longValue = '${'x'.repeat(180)}';`;
    notes[0].content = [
      `A long URL: https://example.com/${'path-segment-'.repeat(18)}`,
      '',
      longWord,
      '',
      '| First column | Second column | Third column |',
      '| --- | --- | --- |',
      `| ${longWord} | ordinary text | ${longWord} |`,
      '',
      '```js',
      longCodeLine,
      '```',
      '',
      '![oversized image](https://example.invalid/oversized-image.png)'
    ].join('\n');

    const fixture = await createNotesFixture();
    const workspace = fixture.nativeElement.querySelector('.editing-workspace') as HTMLElement;
    const markdown = fixture.nativeElement.querySelector('markdown.markdown-code-labels') as HTMLElement;

    expect(workspace.classList.contains('editing')).toBe(true);
    expect(markdown.querySelector('a')?.textContent).toContain('https://example.com/');
    expect(markdown.textContent).toContain(longWord);
    expect(markdown.querySelector('table')).not.toBeNull();
    expect(markdown.querySelector('pre code')?.textContent).toContain(longCodeLine);
    expect(markdown.querySelector('.toolbar-item span')?.textContent).toBe('JavaScript');
    expect(markdown.querySelector('img')?.getAttribute('alt')).toBe('oversized image');

    (fixture.nativeElement.querySelector('#edit-mode') as HTMLInputElement).click();
    fixture.detectChanges();
    expect(workspace.classList.contains('editing')).toBe(false);
    expect(markdown.querySelector('table')).not.toBeNull();
    expect(markdown.querySelector('img')).not.toBeNull();
    fixture.destroy();
  });

  it('renders one correctly labeled block for every note in View All', async () => {
    const fixture: ComponentFixture<FulllistComponent> = TestBed.createComponent(FulllistComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('article.note-card');
    expect(cards).toHaveLength(2);
    expect(cards[0].querySelector('.card-title')?.textContent).toBe('First note');
    expect(cards[0].querySelector('.date')).not.toBeNull();
    expect(cards[0].querySelector('.note-content markdown')).not.toBeNull();
    expect(cards[0].querySelector('p.card-text markdown')).toBeNull();
    expect(window.getComputedStyle(cards[0].querySelector('.note-content')).maxWidth).not.toBe('68ch');
    const markdown = fixture.nativeElement.querySelectorAll('markdown.markdown-code-labels');
    expect(markdown).toHaveLength(2);
    expect(markdown[0].querySelector('.toolbar-item span')?.textContent).toBe('JavaScript');
    expect(markdown[0].querySelector('code .token.keyword')?.textContent).toBe('const');
    expect(markdown[1].querySelector('.toolbar-item span')?.textContent).toBe('Python');
    expect(markdown[1].querySelector('code .token.keyword')?.textContent).toBe('def');
  });
});
