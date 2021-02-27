import { Component, ViewChild, OnInit, AfterViewInit} from '@angular/core';
import { NgbNav } from '@ng-bootstrap/ng-bootstrap';
import {BackboneService} from './backbone.service'
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit{
  links = [
    { path: '/notes', title: 'Notes' },
    { path: '/settings', title: 'Settings' }
  ];

  @ViewChild('topMenu') top_menu : NgbNav = {} as NgbNav

  constructor(private service : BackboneService,
    private route: ActivatedRoute){

  }
  ngOnInit(): void {
    this.service.set_app(this)
  }
  ngAfterViewInit(): void {
  }

  go_to_notes(){
    const page = this.route.snapshot.paramMap.get('page') || '0'
    location.href = this.service.get_notes_url(Number(page))
  }

}
