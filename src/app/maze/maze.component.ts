import { LEADING_TRIVIA_CHARS } from '@angular/compiler/src/render3/view/template';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-maze',
  templateUrl: './maze.component.html',
  styleUrls: ['../app.component.scss', './maze.component.scss']
})
export class MazeComponent implements OnInit {
  height:number =  37;
  width:number =  52;

  squares:number[][] = [...Array(this.height)].map((item, ind) => (
    [...Array(this.width)].map((item, ind) => (
      0
    ))
  ));

  hover:number = -1;

  selected:number[] = [];

  mouseIsDown = false;

  clicked = false;

  constructor() { }

  // onComponentMount
  ngOnInit(): void {

  }

  clickToggle(index:number) {
    this.clicked = true;

    this.toggleTile(index);
  }

  toggleTile(index:number) {
    if (this.mouseIsDown || this.clicked) {
      const newArr = [...this.selected];

      if (newArr.includes(index)) {
        const eleIndex = newArr.findIndex(i => i === index);
  
        newArr.splice(eleIndex, 1);
      } else {
        newArr.push(index);
      }
  
      this.selected = newArr;
    }

    this.clicked = false;
  }

  mouseup() {
    this.mouseIsDown = false
  }

  over(tile:number) {

    console.log(tile);
    
    this.hover = tile;
  }

  out() {
    this.hover = -1;
  }

  calcInd(r:number, c:number) {
    return (r * this.width) + c
  }

}
