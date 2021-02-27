import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {NotesComponent} from './notes/notes.component'
import {SettingsComponent} from './settings/settings.component'

const routes: Routes = [
  { path: 'notes', component: NotesComponent},
  { path: 'notes/:page', component: NotesComponent},
  { path: 'notes/:page/:extra', component: NotesComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'settings/:extra', component: SettingsComponent },
  { path: 'settings/:page/:extra', component: SettingsComponent },
  { path: '**',   component: SettingsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{useHash:true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
