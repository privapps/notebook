import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxMdModule } from 'ngx-md';
import { HttpClientModule } from '@angular/common/http';
import { NotesComponent } from './notes/notes.component';
import { FormsModule } from '@angular/forms';
import { SettingsComponent } from './settings/settings.component';
import { NgbModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxBootstrapIconsModule } from 'ngx-bootstrap-icons';
import {
  questionCircle, tree, keyFill, arrowClockwise, book, fileEarmark, fileEarmarkArrowUpFill,
  cloud, cloudFill, exclamationCircleFill, pencilFill, trashFill, caretUpFill, caretDownFill, fileEarmarkPlusFill
} from 'ngx-bootstrap-icons';
import { FulllistComponent } from './fulllist/fulllist.component';

const icons = {
  questionCircle, tree, keyFill, arrowClockwise, book, fileEarmark, fileEarmarkArrowUpFill,
  cloud, cloudFill, exclamationCircleFill, pencilFill, trashFill, caretUpFill, caretDownFill, fileEarmarkPlusFill
};

@NgModule({
  declarations: [
    AppComponent,
    NotesComponent,
    SettingsComponent,
    FulllistComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    NgxMdModule.forRoot(),
    NgbModule,
    NgbNavModule,
    ReactiveFormsModule,
    NgxBootstrapIconsModule.pick(icons)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
