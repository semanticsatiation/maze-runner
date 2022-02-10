import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tile-key-legend',
  templateUrl: './tile-key-legend.component.html',
  styleUrls: ['./tile-key-legend.component.scss']
})
export class TileKeyLegendComponent implements OnInit {

  @Input() tileClass:string = "";
  @Input() description:string = "";


  constructor() { }

  ngOnInit(): void {
  }
}
