import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tile-keys',
  templateUrl: './tile-keys.component.html',
  styleUrls: ['../maze/maze.component.scss','./tile-keys.component.scss']
})

export class TileKeysComponent implements OnInit {

  @Input() tileClass:string = "";
  @Input() description:string = "";

  keys = [["start-tile", "Right Click = Start"], ["end-tile", "Left Double Click = End"], ["wall-tile", "Single Click/Hold = Walls"], ["seen-tile", "Seen Tiles"], ["final-tile", "Final Path"], ["current-tile", "Leading Tile"], ["weight-tile", "Weight"]];

  constructor() { 
  }

  ngOnInit(): void {
  }
}