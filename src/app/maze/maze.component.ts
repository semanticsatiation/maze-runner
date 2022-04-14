import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MiniNodeObj, NodeObj } from 'src/modules/interfaces/node-obj';
import { GridComponent } from '../grid/grid.component';
import { ASTAR, defaultNode } from '../shared/variables';

export const basicDirections = [[1, 0],[0, 1],[-1, 0],[0, -1]];
export const diagonals = [[1, 1], [-1, -1], [1, -1], [-1, 1]];

export const arraysEqual = (a:number[], b:number[]) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export const areSamePos = (eleObj: NodeObj | MiniNodeObj, target:NodeObj | MiniNodeObj) => {
  return arraysEqual(eleObj.pos, target.pos);
}

@Component({
  selector: 'app-maze',
  templateUrl: './maze.component.html',
  styleUrls: ['../app.component.scss', './maze.component.scss']
})

export class MazeComponent implements OnInit {
  start:number[] = [];

  end:number[] = [];

  height:number = 10;

  width:number = 10;

  squares: NodeObj[][] = [];

  algorithms:string[] = [ASTAR];

  speeds:[string, string][] = [["Slow", "150"], ["Normal", "40"], ["Fast", "1"], ["Instant", "0"]];

  speed:number = 40;

  zoom:number = 100;  

  zooms:number[] = [200, 175, 150, 125, 100, 75, 50, 25]; 

  currentTileType:string = "walls";
  
  isSolving:boolean = false;

  diagonal:boolean = false;

  universal:boolean = false;

  solvedAmount:number = 0;

  menuIsOpen:boolean = false;

  @ViewChildren('grid', { read: GridComponent }) children!: QueryList<GridComponent>;
  
  constructor() {
  }

  ngOnInit(): void {
    this.createSquares();
  }

  solve() {
    if (this.children !== undefined && [...this.children].every(comp => comp.start.length === 2 && comp.end.length === 2)) {
      this.solvedAmount = 0;
      this.isSolving = true;
      this.children.forEach((comp:GridComponent) => comp.solve());
    }
  }

  endMazeManually() {
    if (this.children !== undefined) {
      this.isSolving = false;
      // we must clear no matter what and this is because some mazes might finish before others
      // and clearPath will only work if the maze is NOT solving meaning the finished mazes will never clear
      this.children.forEach((comp:GridComponent) => {comp.isSolving = false; comp.clearPath();});
    }
  }

  incrementStop() {
    this.solvedAmount += 1;

    if (this.solvedAmount >= this.children.length) {
      this.solvedAmount = 0;

      this.isSolving = false;

      this.children.forEach((comp:GridComponent) => comp.isSolving = false);
    }
  }

  setDimensions(option:{event:Event | undefined, number:number | undefined}, dim:string) {
    if (!this.isSolving) {
      let value:number;

      if (option["event"] !== undefined) {
        const target = option["event"].target as HTMLTextAreaElement;
        value = parseInt(target.value);
      } else {
        value = option["number"] || 0;
      }
  
      if (dim === "width" && !(value > 2 && value < 51)) {
        value = 3;
      } else if (dim === "height" && !(value > 0 && value < 51)) {
        value = 1;
      }
  
      if (dim === "width") {
        this.width = value;
      } else if (dim === "height") {
        this.height = value;
      }
  
      this.createSquares();
    }
  }

  createSquares() {
    this.clearMaze();

    this.squares = [...Array(this.height)].map((item, ri) => (
      [...Array(this.width)].map((item, ci) => {
        return {...defaultNode, pos: [ri, ci]};
      })
    ));
  }

  clearMaze() {
    if (!this.isSolving) {
      if (this.universal) {
        // if we solve and then clear maze, we will not have a universal grid since the
        // similarity between all graphs is lost when they start solving using their own algorithms
        this.makeUniversal();

        this.squares.forEach(row => 
          row.forEach(block => Object.assign(block, defaultNode))
        );
  
        this.start = [];
        this.end = [];
        this.clearPath();
      } else {
        this.children.forEach((comp) => comp.clearMaze());
      }
    }
  }

  makeUniversal() {
    if (this.children !== undefined && this.children.length > 1) {
      const firstChild = this.children.first;
      this.squares = firstChild.squares;
      [...this.children].slice(1).forEach((comp) => {comp.start = firstChild.start; comp.end = firstChild.end;});
    }
  }

  clearPath() {
    if (!this.isSolving) {
      this.squares.forEach(row => 
        row.forEach(block => Object.assign(block, {...defaultNode, wall: block.wall, weight: block.weight}))
      );

      if (this.children !== undefined) {
        this.children.forEach((comp:GridComponent) => comp.clearPath());
      }
    }
  }

  changeTileType(event:Event) {
    const target = event.target as HTMLTextAreaElement;

    this.currentTileType = target.value;
  }

  adjustZoom(event:Event) {
    const target = event.target as HTMLTextAreaElement;

    this.zoom = parseInt(target.value);
  }

  placeUniversalGoal(arr:[NodeObj, string]) {
    const node = arr[0];
    const goalType = arr[1];

    const isStart:boolean = goalType === "start";
    const getGoal = (isStartPos:boolean) =>  isStartPos ? (this.start) : (this.end);
    const setGoal = (goalPos:number[]) => isStart ? (this.start = goalPos) : (this.end = goalPos);

    if (!this.isSolving && !node.wall && !node.weight && !areSamePos({pos: getGoal(!isStart)}, node)) {
      if (areSamePos({pos: getGoal(isStart)}, node)) {
        setGoal([]);
      } else {
        setGoal(node.pos);
      }
      
      this.clearPath();
    }
  }

  adjustSpeed(event:Event) {
    if (!this.isSolving) {
      const target = event.target as HTMLTextAreaElement;
  
      this.speed = parseInt(target.value);
    }
  }

  addAlgorithm(algorithm:string) {
    if (!this.isSolving) {
  
      this.algorithms.push(algorithm);
    }
  }

  removeAlgorithm(index:number) {
    if (!this.isSolving) {
      this.algorithms.splice(index, 1);
    }
  }

  toggleUniversal() {
    if (!this.isSolving) {
      this.universal = !this.universal;
    }
  }

  toggleDiagonal() {
    if (!this.isSolving) {
      this.diagonal = !this.diagonal;
    }
  }
}