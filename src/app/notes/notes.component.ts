import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbNav, NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BackboneService } from '../backbone.service'
import { Metadata, Note } from '../data_inteface'
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { HashLocationStrategy, Location, LocationStrategy } from '@angular/common';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  providers: [Location, { provide: LocationStrategy, useClass: HashLocationStrategy }],
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit, AfterViewInit {

  selected_id: number = 0;
  selected_note: Note = {} as Note

  notes: Note[] = []
  metadata: Metadata = {} as Metadata
  is_writing: boolean = false
  url_extra: string | null = null

  @ViewChild('navMenu') nav_menu: NgbNav = {} as NgbNav
  @ViewChild('shortAlert', { static: false }) short_alert: NgbAlert = {} as NgbAlert

  alert_message = '';
  private alert_subj = new Subject<string>();

  constructor(private service: BackboneService,
    private router: Router,
    private modalService: NgbModal,
    private aRoute: ActivatedRoute) {
  }

  async ngOnInit() {
    await this.service.wait_till_ready()
    const extra = this.aRoute.snapshot.paramMap.get('extra')
    const page = Number(this.aRoute.snapshot.paramMap.get('page')) || 0
    if (extra) {
      if (this.service.notes.length <= 0) {
        this.service.set_parameters(extra, true) // first page load
      } else {
        this.url_extra = this.service.get_extra_url()
      }
    }

    if (this.service.notes.length <= 0) {
      if (extra) {
        this.service.set_parameters(extra)
        this.router.navigate(['/settings/' + page + '/' + extra]);
        return
      } else {
        this.service.initial_blank()
        this.service.update_top_menu(0, page)
      }
    }

    if (this.service.is_editing) {
      this.is_writing = true
    }
    this.notes = this.service.notes
    this.metadata = this.service.metadata
    const max = this.notes.length - 1
    const next = Math.min(max, page)
    this.selected_id = next

    const existing_href = location.href
    const next_url_href = this.service.get_notes_url(next)
    if (existing_href != next_url_href) {
      location.href = next_url_href
    }

    if (next < page) {
      this.alert_subj.next('You have fewer items in the list')
    }

    this.alert_subj.subscribe(message => this.alert_message = message);
    this.alert_subj.pipe(debounceTime(5000)).subscribe(() => {
      if (this.short_alert) {
        this.short_alert.close();
      }
    });
    if (this.service.notes_ttl !== null && this.service.notes_ttl !== undefined && Number(this.service.notes_ttl) > 0) {
      const date = new Date()
      date.setSeconds(date.getSeconds() + this.service.notes_ttl.valueOf());
      this.alert_subj.next('This note would live till ' + new DatePipe('en-US').transform(date, 'short'))
      this.service.notes_ttl = -1
    }
    this.get_current_note()
  }

  ngAfterViewInit() {
  }

  /** a workaround to reset markdown preview https://github.com/dimpu/ngx-md/issues/186 */
  private reset_markdown(): Promise<void> {
    return Promise.resolve().then(() => {
      let data = this.service.notes[this.selected_id]
      if (data['content'] != null && data.content.length > 0) {
        // do nothing
        return Promise.resolve()
      }
      data.content = ' '
      return new Promise(resolve => setTimeout(resolve, 10)).then(() => {
        data.content = ''
      })
    })
  }

  move_note(up: boolean) {
    if (up && this.selected_id == 0 ||
      (!up && this.selected_id + 1 == this.notes.length)) {
      return
    }
    this.service.note_position_up(this.selected_id, up)
    let position = this.selected_id + (up ? -1 : +1)
    this.nav_menu.select(position)
  }
  delete_note() {
    if (!confirm("Are you sure to delete it?")) {
      return
    }
    const current = this.selected_id
    let next = current - 1
    this.notes.splice(this.selected_id, 1);
    if (next < 0) {
      next = 0
    }
    // this.nav_menu.select(next)
    this.selected_id = next
    this.get_current_note()
  }
  get_current_note(): Promise<Note> {
    this.selected_note = this.service.notes[this.selected_id]
    if (this.nav_menu) {
      this.nav_menu.select(this.selected_id)
    }
    return this.reset_markdown().then(() =>
      this.selected_note
    )
  }
  add_note() {
    const last = this.notes[this.notes.length - 1]
    if (this.selected_note === null || this.selected_note['name'] === null || this.selected_note.name.length <= 0 ||
      last == null || last['name'] === null || last.name.length <= 0) {
      this.alert_subj.next('Please finish this up')
    } else {
      this.notes.push({
        name: 'New',
        date: new Date(),
        content: ''
      })
    }
    this.selected_id = this.notes.length - 1
    this.get_current_note()
  }
  open(allNotes: any) {
    this.modalService.open(allNotes, { size: 'xl', scrollable: true, backdrop: true, keyboard: true })
  }
  update_writing() {
    let editing = !this.is_writing // there is a delay to make the changes

    if (this.service.parameters.type != 'ed') {
      this.url_extra = ''
    } else {
      this.service.reset_parameters()
      this.get_current_note()
    }
    if (!editing && this.service.is_content_changed()) {
      alert('Make sure to save the changes if you made modification.')
    }
    this.service.is_editing = editing
  }
}
