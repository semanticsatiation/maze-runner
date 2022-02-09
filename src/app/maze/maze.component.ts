import { Component, OnInit } from '@angular/core';

const delay = (delayInms:number) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(2);
    }, delayInms);
  });
};

@Component({
  selector: 'app-maze',
  templateUrl: './maze.component.html',
  styleUrls: ['../app.component.scss', './maze.component.scss']
})

export class MazeComponent implements OnInit {
  height:number = 15;
  width:number = 15;

  squares:number[][] = this.createSquares();

  start:number[] = [];

  end:number[] = [];

  selected:number[][] = [];

  seen:number[][] = [];

  finalPath:number[][] = [];

  possiblePositions:number[][] = [];

  currentPosition:number[] = [];

  mouseIsDown = false;

  clicked = false;

  branchingPaths: {
    [key: number]: number[]
  } = [];

  constructor() { }

  // onComponentMount
  ngOnInit(): void {

  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
  //   //Add '${implements OnChanges}' to the class.
    
  // }
  

  clickToggle(array:[number, number]) {
    this.clicked = true;

    this.toggleTile(array);
  }

  createSquares() {
    this.clearPath()
    return this.squares = [...Array(this.height)].map((item, ind) => (
      [...Array(this.width)].map((item, ind) => (
        0
      ))
    ));
  }

  toggleTile(array:[number, number]) {
    if ((this.mouseIsDown || this.clicked) && this.calcInd(array) !== this.calcInd(this.start) && this.calcInd(array) != this.calcInd(this.end)) {
      const newArr = [...this.selected];

      if (this.isPresent(newArr, array)) {
        const eleIndex = newArr.findIndex(i => this.calcInd(i) === this.calcInd(array));

        if (eleIndex !== -1) {
          newArr.splice(eleIndex, 1);
        }
      } else {
        newArr.push(array);
      }

      this.clearPath();
  
      this.selected = newArr;
    }

    this.clicked = false;
  }
  
  calcInd(arr:number[]) {
    return (arr[0] * this.width) + arr[1];
  }

  isPositionPresent(target:number[]) {
    return this.isPresent(this.selected, target);
  }

  isPresent(array:number[][], target:number[]) {
    return array.find(ele => this.calcInd(ele) === this.calcInd(target)) !== undefined;
  }

  clearMaze() {
    this.selected = [];
    this.start = [];
    this.end = [];

    this.clearPath();
  }

  clearPath() {
    this.seen = [];
    this.finalPath = [];
    this.possiblePositions = [];
    this.branchingPaths = {};
    this.currentPosition = this.start;
  }
  

  placeStart(array:[number, number]) {
    if (!this.isPositionPresent(array) && this.calcInd(this.end) !== this.calcInd(array)) {
      if (this.calcInd(this.start) === this.calcInd(array)) {
        this.start = [-1, -1];
      } else {
        this.start = array;
      }
    }
  }

  placeEnd(array:[number, number]) {
    if (!this.isPositionPresent(array) && this.calcInd(this.start) !== this.calcInd(array)) {
      if (this.calcInd(this.end) === this.calcInd(array)) {
        this.end = [-1, -1];
      } else {
        this.end = array;
      }
    }
  }

  filterPositions() {
    const adjacentSquares = this.findNeighbors(this.currentPosition);
    
    adjacentSquares.forEach(possibleChoice => {
      if (!this.isPresent(this.possiblePositions, possibleChoice) && !this.isPresent(this.seen, possibleChoice)) {
        this.possiblePositions.push(possibleChoice);
        this.branchingPaths[this.calcInd(possibleChoice)] = this.currentPosition;
      }
    });
    
    return this.possiblePositions;
  }

  async solve() {
    this.clearPath();
    this.possiblePositions = [this.start];
    this.currentPosition = this.start;

    while (this.calcInd(this.currentPosition) !== this.calcInd(this.end) && this.possiblePositions.length !== 0) {
      let delayres = await delay(20);
      const positions:number[][] = this.filterPositions();
      this.updatePath(this.bestPosFScore(positions));
    }

    this.finalPath = this.findPath();
  }

  bestPosFScore(positions:number[][]) {
    return positions.reduce((chosenPoint, point) => {
      const old_f = this.manhattanDistance(chosenPoint);
      const new_f = this.manhattanDistance(point);

      if (old_f > new_f) {
        return point;
      } else {
        return chosenPoint;
      }
    });
  }

  
  manhattanDistance(pos:number[]) {
    // f = g + h

    // lowest fscore is best path

    return (
      // gscore = distance between the current node and the start node
      this.findPath(pos).length 
      + 
      // hscore = estimated distance from the current node to the end node.
      (Math.abs(pos[0] - this.end[0]) + Math.abs(pos[1] - this.end[1]))
    );
  }
  

  updatePath(newPos:number[]) {
    this.currentPosition = newPos;

    const posInd = this.possiblePositions.findIndex(ele => this.calcInd(ele) === this.calcInd(newPos));
    
    this.possiblePositions.splice(posInd, 1);

    this.seen.push(newPos);
  }

  setWidth(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.width = parseInt(target.value);
    this.createSquares();
  }

  setHeight(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    
    this.height = parseInt(target.value);
    this.createSquares();
  }

  findNeighbors(point:number[]) {
    const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    const neighbors:number[][] = [];

    directions.forEach(a => {
      const neighbor = [(a[0] + point[0]), (a[1] + point[1])];
      
      if ((neighbor[0] >= 0 && neighbor[0] <= (this.height - 1) && neighbor[1] >= 0 && neighbor[1] <= (this.width - 1)) && !this.isPositionPresent(neighbor)) {
        neighbors.push(neighbor);
      }
    });

    return neighbors;
  }

  findPath(goal = this.end) {
    const path:number[][] = [goal];
    let spot:number[] = goal;

    while (this.branchingPaths[this.calcInd(spot)] !== undefined) {
      // keep pushing the positions until we hit the goal
      path.push(this.branchingPaths[this.calcInd(spot)]);
      spot = this.branchingPaths[this.calcInd(spot)];
    }

    // the returned value will tell us what nodes were taken to reach the goal
    return path;
  }
}
