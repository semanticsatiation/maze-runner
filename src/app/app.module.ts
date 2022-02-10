import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { MazeComponent } from './maze/maze.component';
import { TileKeyLegendsComponent } from './tile-key-legends/tile-key-legends.component';

@NgModule({
  declarations: [
    AppComponent,
    MazeComponent,
    TileKeyLegendsComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
