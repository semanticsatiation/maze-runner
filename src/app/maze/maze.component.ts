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

  isSolving:boolean = false;

  constructor() { }

  ngOnInit(): void {

  }

  calcInd(arr:number[]) {
    return (arr[0] * this.width) + arr[1];
  }

  areSamePos(arrOne:number[], arrTwo:number[]) {
    return this.calcInd(arrOne) === this.calcInd(arrTwo);
  }

  clickToggle(array:[number, number]) {
    this.clicked = true;

    this.toggleTile(array);
  }

  createSquares() {
    this.clearMaze();

    return this.squares = [...Array(this.height)].map((item, ind) => (
      [...Array(this.width)].map((item, ind) => (
        0
      ))
    ));
  }

  toggleTile(array:[number, number]) {
    if (!this.isSolving && (this.mouseIsDown || this.clicked) && !this.areSamePos(array, this.start) && !this.areSamePos(array, this.end)) {
      const newArr = [...this.selected];

      if (this.isPresent(newArr, array)) {
        const eleIndex = newArr.findIndex(ele => this.areSamePos(ele, array));

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

  isPositionPresent(target:number[]) {
    return this.isPresent(this.selected, target);
  }

  isPresent(array:number[][], target:number[]) {
    return array.find(ele => this.areSamePos(ele, target)) !== undefined;
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
  }

  placeGoal(array:number[], goal:string) {
    const isStart:boolean = goal === "start";
    const getGoal = (isStartPos:boolean) =>  isStartPos ? this.start : this.end;
    const setGoal = (goal:number[]) => isStart ? this.start = goal : this.end = goal;

    if (!this.isSolving && !this.isPositionPresent(array) && !this.areSamePos(getGoal(!isStart), array)) {
      if (this.areSamePos(getGoal(isStart), array)) {
        setGoal([]);
      } else {
        setGoal(array);
      }

      this.clearPath(); 
    }
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

  filterNeighbors() {
    const adjacentSquares = this.findNeighbors(this.currentPosition);
    
    adjacentSquares.forEach(neighbor => {
      if (!(this.isPresent(this.seen, neighbor) || this.isPresent(this.possiblePositions, neighbor))) {
        this.possiblePositions.push(neighbor);
        this.branchingPaths[this.calcInd(neighbor)] = this.currentPosition;
      }
    });
  }

  async solve() {
    if (this.start.length === 2 && this.end.length === 2) {
      this.isSolving = true;
      this.clearPath();

      this.currentPosition = this.start;
      this.possiblePositions = [this.start];
      this.seen = [this.start];
  
      while (this.possiblePositions.length !== 0 && !this.areSamePos(this.currentPosition, this.end)) {
        let delayRes = await delay(20);

        this.currentPosition = this.bestPosFScore(this.possiblePositions);

        const posInd = this.possiblePositions.findIndex(ele => this.areSamePos(ele, this.currentPosition));
        
        this.possiblePositions.splice(posInd, 1);

        this.seen.push(this.currentPosition);

        this.filterNeighbors();
      }
  
      this.finalPath = this.findPath();
  
      this.isSolving = false;
    }
  }

  bestPosFScore(positions:number[][]) {
    // pick the position with the best fScore
    return positions.reduce((chosenPoint, point) => {
      const oldFScore = this.manhattanDistance(chosenPoint);
      const newFScore = this.manhattanDistance(point);

      if (oldFScore > newFScore) {
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

  setDimensions(event:Event, dim:string) {
    const target = event.target as HTMLTextAreaElement;
    const value = parseInt(target.value);

    if (dim === "width") {
      this.width = value;
    } else {
      this.height = value;
    }

    this.createSquares();
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
