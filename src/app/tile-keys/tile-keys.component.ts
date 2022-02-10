import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tile-keys',
  templateUrl: './tile-keys.component.html',
  styleUrls: ['../maze/maze.component.scss','./tile-keys.component.scss']
})

export class TileKeysComponent implements OnInit {

  @Input() tileClass:string = "";
  @Input() description:string = "";

  keys = [["start-tile", "Start"], ["end-tile", "End"], ["wall", "Walls"], ["seen-tile", "Seen Tiles"], ["final-tile", "Shortest Path"]];

  constructor() { 
  }

  ngOnInit(): void {
  }
}
