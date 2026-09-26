import { DatePipe } from '@angular/common';
import { Component, Injectable, Input, SecurityContext, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { marked } from 'marked';
import { MarkdownComponent, MarkdownService } from 'ngx-markdown';
import { Note } from '../data_inteface';

@Injectable()
class NoteMarkdownService extends MarkdownService {
  private readonly htmlSanitizer = inject(DomSanitizer);

  override parse(markdown: string): string {
    // Stored Markdown is not indented template content: preserve its code blocks.
    const html = marked.parse(markdown, { async: false });
    return this.htmlSanitizer.sanitize(SecurityContext.HTML, html) ?? '';
  }
}

@Component({
  selector: 'article[app-note-card]',
  templateUrl: './note-card.component.html',
  imports: [DatePipe, MarkdownComponent],
  providers: [{ provide: MarkdownService, useClass: NoteMarkdownService }],
  host: { class: 'card note-card' }
})
export class NoteCardComponent {
  @Input({ required: true }) note!: Note;
}
