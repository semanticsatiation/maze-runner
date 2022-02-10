import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { MazeComponent } from './maze/maze.component';
import { TileKeyLegendComponent } from './tile-key-legend/tile-key-legend.component';

@NgModule({
  declarations: [
    AppComponent,
    MazeComponent,
    TileKeyLegendComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
