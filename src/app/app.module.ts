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
import { NgbModule,NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxBootstrapIconsModule, allIcons } from 'ngx-bootstrap-icons';
import { FulllistComponent } from './fulllist/fulllist.component';

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
    NgxBootstrapIconsModule.forRoot(allIcons)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
