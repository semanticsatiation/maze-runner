import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
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

  childrenTotal:number = 1;

  wallsTotal:number = 0;

  timeoutHandler: NodeJS.Timeout | null | undefined;


  @ViewChildren('grid', { read: GridComponent }) children!: QueryList<GridComponent>;
  
  constructor(private elementRef:ElementRef) {
  }

  ngOnInit(): void {
    this.createSquares();
  }

  solve() {
    if (this.childrenTotal > 0 && [...this.children].every(comp => comp.start.length === 2 && comp.end.length === 2)) {
      this.solvedAmount = 0;
      this.isSolving = true;
      this.children.forEach((comp:GridComponent) => comp.solve());
    }
  }

  endMazeManually() {
    this.isSolving = false;
    // we must clear no matter what and this is because some mazes might finish before others
    // and clearPath will only work if the maze is NOT solving meaning the finished mazes will never clear
    this.children.forEach((comp:GridComponent) => {comp.isSolving = false; comp.clearPath();});
  }

  incrementStop() {
    this.solvedAmount += 1;

    if (this.solvedAmount >= this.childrenTotal) {
      this.solvedAmount = 0;

      this.isSolving = false;

      this.children.forEach((comp:GridComponent) => comp.isSolving = false);
    }
  }

  mousedown(action:Function, dimType:string) {
    this.timeoutHandler = setInterval(() => {
      this.setDimensions({event: undefined, number: action(dimType === "height" ? (this.height) : (this.width))}, dimType);
    }, 50);
  }

  increaseNumber(num:number) {
    return num + 1;
  }

  decreaseNumber(num:number) {
    return num - 1; 
  }

  mouseup() {
    if (this.timeoutHandler) {
      clearInterval(this.timeoutHandler);
      this.timeoutHandler = null;
    }
  }

  setDimensions(option:{event:Event | undefined, number:number | undefined}, dimType:string) {
    if (!this.isSolving) {
      let value:number;

      if (option["event"] !== undefined) {
        const target = option["event"].target as HTMLTextAreaElement;
        value = parseInt(target.value);
      } else {
        value = option["number"] || 0;
      }
  
      if (dimType === "width") {
        if (value > 50) {
          value = 3;
        } else if (value < 3) {
          value = 50;
        }
      } else if (dimType === "height") {
        if (value > 50) {
          value = 1;
        } else if (value < 1) {
          value = 50;
        }
      }
  
      if (dimType === "width") {
        this.width = value;
      } else if (dimType === "height") {
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
      }

      if (this.children) {
        this.children.forEach((comp:GridComponent) => comp.clearMaze());
      }

      this.wallsTotal = 0;
      this.start = [];
      this.end = [];
    }
  }

  clearPath() {
    if (!this.isSolving && this.children) {
      this.children.forEach((comp:GridComponent) => comp.clearPath());
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

  placeUniversalTile(pos:number[]) {
    if (this.currentTileType === "walls") {
      if (!this.squares[pos[0]][pos[1]].wall) {
        this.wallsTotal += 1;
      } else {
        this.wallsTotal -= 1;
      }

      this.squares[pos[0]][pos[1]].wall = !this.squares[pos[0]][pos[1]].wall;
    } else {
      this.squares[pos[0]][pos[1]].weight = !this.squares[pos[0]][pos[1]].weight;
    } 
  }

  adjustSpeed(event:Event) {
    const target = event.target as HTMLTextAreaElement;

    this.speed = parseInt(target.value);
  }

  addAlgorithm(algorithm:string) {
    if (!this.isSolving) {
  
      this.algorithms.push(algorithm);

      this.clearPath();

      this.childrenTotal += 1;
    }
  }

  removeAlgorithm(index:number) {
    if (!this.isSolving) {
      this.algorithms.splice(index, 1);

      this.childrenTotal -= 1;

      if (this.universal && this.childrenTotal <= 0) {
        // if we delete all grids, make sure the next grid that is added is clear
        this.clearMaze();
      }
    }
  }

  makeUniversal() {
    if (this.childrenTotal > 0) {
      const firstChild = this.children.first;
    
      this.squares = firstChild.squares;
  
      // by destructuring, we can ensure that each child componenet see this as a change
      // angular only detects array changes based on the reference and not the contents of the array
      this.start = [...firstChild.start];
      this.end = [...firstChild.end];
  
      this.wallsTotal = firstChild.wallsTotal;
  
      this.children.forEach((comp:GridComponent) => comp.wallsTotal = firstChild.wallsTotal);
  
      this.clearPath();
    }
  }

  toggleUniversal() {
    if (!this.isSolving) {
      this.universal = !this.universal;

      if (this.universal) {
        this.makeUniversal();
      } else {
        this.children.forEach((comp:GridComponent) => comp.makeUnique());
      }
    }
  }

  toggleDiagonal() {
    if (!this.isSolving) {
      this.diagonal = !this.diagonal;
    }
  }
}