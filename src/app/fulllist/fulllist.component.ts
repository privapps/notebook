import { Component, OnInit } from '@angular/core';
import {BackboneService} from '../backbone.service'
import { Note} from '../data_inteface'

@Component({
  selector: 'app-fulllist',
  templateUrl: './fulllist.component.html',
  styleUrls: ['./fulllist.component.css']
})
export class FulllistComponent implements OnInit {
  notes : Note[] = []

  constructor(private service: BackboneService) { }

  ngOnInit(): void {
    this.notes = this.service.notes
  }

}
