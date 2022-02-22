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
  height:number = 13;

  width:number = 28;

  algorithm:string = "A*";

  algorithms:string[] = ["A*", "Dijkstra"];

  squares:number[][] = this.createSquares();

  start:number[] = [6, 14];

  end:number[] = [12, 27];

  selected:number[][] = [];

  seen:number[][] = [];

  finalPath:number[][] = [];

  possiblePositions:number[][] = [];

  currentPosition:number[] = [];

  mouseIsDown = false;

  clicked = false;

  speed:number = 20;

  speeds:any[] = [["Slow", "150"], ["Normal", "20"], ["Fast", "1"], ["Instant", "0"]];

  zoom:number = 100;  

  zooms:number[] = [200, 175, 150, 125, 100, 75, 50, 25]; 

  branchingPaths: {
    [key: string]: number[]
  } = {};
  
  isSolving:boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  calcZoom() {
    return ((this.zoom / 100) * 17) + "px";
  }

  adjustZoom(event:Event) {
    const target = event.target as HTMLTextAreaElement;

    this.zoom = parseInt(target.value);
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
      [...Array(this.width)].map((item, ind) => 0)
    ));
  }

  adjustSpeed(event:Event) {
    if (!this.isSolving) {
      const target = event.target as HTMLTextAreaElement;
  
      this.speed = parseInt(target.value);
    }
  }

  setAlgorithm(event:Event) {
    if (!this.isSolving) {
      const target = event.target as HTMLTextAreaElement;
  
      this.algorithm = target.value;
    }
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
    if (!this.isSolving) {
      this.selected = [];
      this.start = [];
      this.end = [];
  
      this.clearPath();
    }
  }

  clearPath() {
    if (!this.isSolving) {
      this.seen = [];
      this.finalPath = [];
      this.possiblePositions = [];
      this.branchingPaths = {};
    }
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

  setDimensions(option:{event:Event | undefined, number:number | undefined}, dim:string) {
    if (!this.isSolving) {
      let value:number;

      if (option["event"] !== undefined) {
        const target = option["event"].target as HTMLTextAreaElement;
        value = parseInt(target.value);
      } else {
        value = option["number"] || 0;
      }
  
      if (dim === "width" && !(value > 2 && value < 100)) {
        value = 3;
      } else if (dim === "height" && !(value > 0 && value < 100)) {
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

  findNeighbors(position:number[]) {
    const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    const neighbors:number[][] = [];

    directions.forEach(direction => {
      const neighbor = [(direction[0] + position[0]), (direction[1] + position[1])];
      
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
        this.branchingPaths[neighbor.toString()] = this.currentPosition;
      }
    });
  }

  async solve() {
    if (this.start.length === 2 && this.end.length === 2 && !this.isSolving) {
      this.clearPath();

      this.isSolving = true;
      this.currentPosition = this.start;
      this.possiblePositions = [this.start];
      this.seen = [this.start];
  
      while (this.possiblePositions.length !== 0 && !this.areSamePos(this.currentPosition, this.end)) {

        if (this.speed !== 0) {
          let delayRes = await delay(this.speed);
        }


        if (this.algorithm === "A*") {
          // a* algorithm (informed)
          this.currentPosition = this.bestPosFScore(this.possiblePositions);
        } else {
          // Dijkstra’s algorithm (uninformed)
          this.currentPosition = this.reduceArray(this.possiblePositions, (position:number[]) => this.findPath(position).length);
        }

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

    return this.reduceArray(positions, (position:number[]) => this.manhattanDistance(position));
  }

  reduceArray(array:number[][], reducer:Function) {
    return array.reduce((prevPos, currentPos) => {
      const oldFScore = reducer(prevPos);
      const newFScore = reducer(currentPos);

      if (oldFScore > newFScore) {
        return currentPos;
      } else {
        return prevPos;
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

  findPath(goal = this.end) {
    const path:number[][] = [goal];
    let spot:string = goal.toString();

    while (this.branchingPaths[spot] !== undefined) {
      // keep pushing the positions until we hit undefined

      // this loop works by using the value of the current goal to give us the path that led us from the starting position to the current goal

      // if our goal is [12, 27], we will start off of [12, 27] which the value then leads us to [12, 26]
      // which then leads us to the key [12, 26] which then gives us the value [12, 25] and then we keep doing this 
      // working our way backwards until we reach a key-value pair where the value is not a key in branchingPaths 
      // which means we've reached the beginning (or starting position)
      // {
      //   [12,14]: [11, 14],
      //   [12,15]: [12, 14],
      //   [12,16]: [12, 15],
      //   [12,17]: [12, 16],
      //   [12,18]: [12, 17],
      //   [12,19]: [12, 18],
      //   [12,20]: [12, 19],
      //   [12,21]: [12, 20],
      //   [12,22]: [12, 21],
      //   [12,23]: [12, 22],
      //   [12,24]: [12, 23],
      //   [12,25]: [12, 24],
      //   [12,26]: [12, 25],
      //   [12,27](goal): [12, 26]
      // }

      path.push(this.branchingPaths[spot]);
      spot = this.branchingPaths[spot].toString();
    }

    // the returned value will tell us what positions were taken to reach the current goal
    return path;
  }
}