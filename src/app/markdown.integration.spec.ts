import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarkdownComponent, MarkdownModule } from 'ngx-markdown';
import { Prism } from './prism';

@Component({
  template: `
    <markdown class="markdown-code-labels" [data]="inlineMarkdown"></markdown>
    <markdown [src]="assetPath"></markdown>
  `,
  standalone: true,
  imports: [MarkdownComponent]
})
class MarkdownHostComponent {
  inlineMarkdown = '# Inline note\n\n| Column | Value |\n| --- | --- |\n| One | Two |';
  assetPath = './assets/css/settings-help.md';
}

describe('Markdown integration', () => {
  let fixture: ComponentFixture<MarkdownHostComponent>;
  let httpController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MarkdownHostComponent,
        MarkdownModule.forRoot({ loader: HttpClient })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MarkdownHostComponent);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpController.verify());

  it('renders inline Markdown and asset-backed Markdown', async () => {
    fixture.detectChanges();
    httpController.expectOne('./assets/css/settings-help.md').flush('# Asset help');
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();

    const renderedMarkdown = fixture.nativeElement.querySelectorAll('markdown');
    expect(renderedMarkdown[0].querySelector('h1')?.textContent).toContain('Inline note');
    expect(renderedMarkdown[0].querySelector('table')).not.toBeNull();
    expect(renderedMarkdown[1].querySelector('h1')?.textContent).toContain('Asset help');
  });

  it('keeps every supported Prism language registered', () => {
    const supportedLanguages = [
      'python', 'java', 'bash', 'javascript', 'css', 'json', 'yaml',
      'rust', 'go', 'c', 'cpp'
    ];

    for (const language of supportedLanguages) {
      expect(Prism.languages[language], language).toBeTruthy();
    }
  });

  it('renders highlighted code with one visible language label per block', async () => {
    fixture.componentInstance.inlineMarkdown = [
      '```js',
      'const answer = 42;',
      '```',
      '',
      '```',
      '<plain text>',
      '```'
    ].join('\n');
    fixture.detectChanges();
    httpController.expectOne('./assets/css/settings-help.md').flush('');
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();

    const markdown = fixture.nativeElement.querySelector('markdown');
    const blocks = markdown.querySelectorAll('.code-toolbar');
    expect(blocks).toHaveLength(2);
    expect(blocks[0].querySelector('.toolbar-item span')?.textContent).toBe('JavaScript');
    expect(blocks[0].querySelector('code .token.keyword')?.textContent).toBe('const');
    expect(blocks[1].querySelector('.toolbar-item span')?.textContent).toBe('Plain text');
    expect(blocks[1].querySelector('code')?.textContent?.trim()).toBe('<plain text>');
  });

  it('highlights every supported language using its registered grammar', async () => {
    const examples = [
      { language: 'python', label: 'Python', source: 'def greet(name): return name', token: 'keyword', value: 'def' },
      { language: 'java', label: 'Java', source: 'public class Example {}', token: 'keyword', value: 'public' },
      { language: 'bash', label: 'Bash', source: 'echo hello', token: 'builtin', value: 'echo' },
      { language: 'javascript', label: 'JavaScript', source: 'const answer = 42;', token: 'keyword', value: 'const' },
      { language: 'css', label: 'CSS', source: 'color: red;', token: 'property', value: 'color' },
      { language: 'json', label: 'JSON', source: '"answer": true', token: 'boolean', value: 'true' },
      { language: 'yaml', label: 'YAML', source: 'name: value', token: 'key', value: 'name' },
      { language: 'rust', label: 'Rust', source: 'fn main() {}', token: 'keyword', value: 'fn' },
      { language: 'go', label: 'Go', source: 'package main', token: 'keyword', value: 'package' },
      { language: 'c', label: 'C', source: 'int main(void) {}', token: 'keyword', value: 'int' },
      { language: 'cpp', label: 'C++', source: 'int main() {}', token: 'keyword', value: 'int' }
    ];
    fixture.componentInstance.inlineMarkdown = examples
      .map(example => `\`\`\`${example.language}\n${example.source}\n\`\`\``)
      .join('\n\n');
    fixture.detectChanges();
    httpController.expectOne('./assets/css/settings-help.md').flush('');
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();

    const markdown = fixture.nativeElement.querySelector('markdown');
    const blocks = markdown.querySelectorAll('.code-toolbar');
    expect(blocks).toHaveLength(examples.length);

    examples.forEach((example, index) => {
      expect(blocks[index].querySelector(`.token.${example.token}`)?.textContent).toBe(example.value);
      expect(blocks[index].querySelector('.toolbar-item span')?.textContent).toBe(example.label);
    });

    Prism.highlightAllUnder(markdown);
    expect(markdown.querySelectorAll('.code-toolbar')).toHaveLength(examples.length);
    expect(markdown.querySelectorAll('.toolbar-item span')).toHaveLength(examples.length);
  });

  it('keeps unsupported language fences as readable code with a label', async () => {
    fixture.componentInstance.inlineMarkdown = '```unknown-lexer\n<unknown code>\n```';
    fixture.detectChanges();
    httpController.expectOne('./assets/css/settings-help.md').flush('');
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();

    const markdown = fixture.nativeElement.querySelector('markdown');
    expect(markdown.querySelector('.toolbar-item span')?.textContent).toBe('Unknown-lexer');
    expect(markdown.querySelector('code')?.textContent?.trim()).toBe('<unknown code>');
    expect(markdown.querySelector('.token')).toBeNull();
  });

});
