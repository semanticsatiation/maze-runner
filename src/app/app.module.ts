import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { MazeComponent } from './maze/maze.component';
import { TileKeysComponent } from './tile-keys/tile-keys.component';

@NgModule({
  declarations: [
    AppComponent,
    MazeComponent,
    TileKeysComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
