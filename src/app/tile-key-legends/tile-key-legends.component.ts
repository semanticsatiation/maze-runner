import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tile-key-legends',
  templateUrl: './tile-key-legends.component.html',
  styleUrls: ['../maze/maze.component.scss', './tile-key-legends.component.scss']
})

export class TileKeyLegendsComponent implements OnInit {

  @Input() tileClass:string = "";
  @Input() description:string = "";

  keys = [["start-tile", "Start"], ["end-tile", "End"], ["wall", "Walls"], ["seen-tile", "Seen Tiles"], ["final-tile", "Shortest Path"]];

  constructor() { 
  }

  ngOnInit(): void {
  }
}
