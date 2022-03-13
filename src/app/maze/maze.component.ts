import { Component, OnInit } from '@angular/core';

const delay = (delayInms:number) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(2);
    }, delayInms);
  });
};

const defaultNode = {
  f: 999, 
  g: 999, 
  h: 999,
  parent: undefined, 
  seen: false, 
  final: false,
  closed: false,
  wall: false,
  // weight cost is 20
  weight: false
};

interface NodeObj {
  pos: number[],
  f: number, 
  g: number, 
  h: number,
  parent?: NodeObj, 
  seen: boolean, 
  final: boolean,
  closed: boolean,
  wall: boolean,
  weight: boolean
}

interface MiniNodeObj {
  pos: number[],
};

@Component({
  selector: 'app-maze',
  templateUrl: './maze.component.html',
  styleUrls: ['../app.component.scss', './maze.component.scss']
})

export class MazeComponent implements OnInit {
  height:number = 10;

  width:number = 10;

  algorithm:string = "A*";

  algorithms:string[] = ["A*", "Dijkstra", "Breadth First Search"];

  squares: NodeObj[][] = [];

  start:number[] = [];

  end:number[] = [];

  openList:NodeObj[] = [];

  currentNode:NodeObj = {pos: [], ...defaultNode};

  mouseIsDown = false;

  clicked:boolean = false;
  
  speeds:[string, string][] = [["Slow", "150"], ["Normal", "40"], ["Fast", "1"], ["Instant", "0"]];

  speed:number = 40;

  zoom:number = 100;  

  zooms:number[] = [200, 175, 150, 125, 100, 75, 50, 25]; 

  currentTileType:string = "walls";
  
  isSolving:boolean = false;

  seenTotal:number = 0;

  wallsTotal:number = 0;

  seenTotalPercentage:number = 0;

  finalTotal:number = 0;

  totalSteps:number = 0;

  timeTaken:number = 0;

  ngOnInit(): void {
    this.createSquares();
  }

  createSquares() {
    this.clearMaze();

    this.squares = [...Array(this.height)].map((item, ri) => (
      [...Array(this.width)].map((item, ci) => {
        return {...defaultNode, pos: [ri, ci]};
      })
    ));
  }

  calcZoom() {
    return ((this.zoom / 100) * 17) + "px";
  }

  changeTileType(event:Event) {
    const target = event.target as HTMLTextAreaElement;

    this.currentTileType = target.value;
  }

  adjustZoom(event:Event) {
    const target = event.target as HTMLTextAreaElement;

    this.zoom = parseInt(target.value);
  }

  isPresent(arrOfObjs:NodeObj[] | MiniNodeObj[], target:NodeObj | MiniNodeObj) {
    return arrOfObjs.find((ele: NodeObj | MiniNodeObj) => this.areSamePos(ele, target)) !== undefined;
  }

  areSamePos(eleObj: NodeObj | MiniNodeObj, target:NodeObj | MiniNodeObj) {
    return eleObj.pos.toString() === target.pos.toString();
  }

  clickToggle(node:NodeObj) {
    this.clicked = true;

    this.toggleTile(node);
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

  toggleTile(node:NodeObj) {
    if (!this.isSolving && (this.mouseIsDown || this.clicked) && !this.areSamePos(node, {pos: this.start}) && !this.areSamePos(node, {pos: this.end})) {
      this.clearPath();
  
      if (this.currentTileType === "walls") {
        if (!node.wall) {
          this.wallsTotal += 1;
        } else {
          this.wallsTotal -= 1;
        }
        
        node.wall = !node.wall;
      } else {
        node.weight = !node.weight;
      }
    }

    this.clicked = false;
  }

  clearMaze() {
    if (!this.isSolving) {
      this.squares.forEach(row => 
        row.forEach(block => Object.assign(block, defaultNode))
      );

      this.start = [];
      this.end = [];
  
      this.clearPath();
    }
  }

  clearPath() {
    if (!this.isSolving) {
      this.squares.forEach(row => 
        row.forEach(block => Object.assign(block, {...defaultNode, wall: block.wall, weight: block.weight}))
      );

      this.openList = [];
      this.currentNode = {pos: [], ...defaultNode};
      this.seenTotal = 0;
      this.finalTotal = 0;
      this.totalSteps = 0;
      this.timeTaken = 0;
      this.seenTotalPercentage = 0;
    }
  }

  placeGoal(node:NodeObj, goal:string) {
    const isStart:boolean = goal === "start";
    const getGoal = (isStartPos:boolean) =>  isStartPos ? (this.start) : (this.end);
    const setGoal = (goal:number[]) => isStart ? (this.start = goal) : (this.end = goal);

    if (!this.isSolving && !node.wall && !node.weight && !this.areSamePos({pos: getGoal(!isStart)}, node)) {
      if (this.areSamePos({pos: getGoal(isStart)}, node)) {
        setGoal([]);
      } else {
        setGoal(node.pos);
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
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const neighbors:NodeObj[] = [];

    directions.forEach(direction => {
      const neighborPos = [(direction[0] + position[0]), (direction[1] + position[1])];

      if (neighborPos[0] >= 0 && neighborPos[0] <= (this.height - 1) && neighborPos[1] >= 0 && neighborPos[1] <= (this.width - 1)) {
        const neighborNode = this.squares[neighborPos[0]][neighborPos[1]];

        // if the neighborPos is within the maze boundaries and it is not a wall or closed, push it into the neighbors array
        if (!neighborNode.wall && !neighborNode.closed) {
          if (this.algorithm !== "A*") {
            neighbors.push(neighborNode);
          } else {
            neighbors.unshift(neighborNode);
          }
        }
      }
    });

    return neighbors;
  }

  filterNeighbors() {
    const adjacentSquares = this.findNeighbors(this.currentNode.pos);

    for (let index = 0; index < adjacentSquares.length; index++) {
      const neighborNode = adjacentSquares[index];

      const isNotInQueue = !this.isPresent(this.openList, neighborNode);

      if (this.algorithm === "Breadth First Search") {
        if (isNotInQueue) {
          neighborNode.parent = this.currentNode;
          this.openList.push(neighborNode);
        }
      } else {
        // if the neighbor is weighted, make sure to take it into account
        const tempGScore = this.currentNode.g + this.distanceFromTo(neighborNode, this.currentNode) + (neighborNode.weight ? (neighborNode.g + 20) : (0));

        if (isNotInQueue) {
          if (this.algorithm !== "A*") {
            this.openList.push(neighborNode);
          } else {
            this.openList.unshift(neighborNode);
          }
        // no need to update the neighborNode if the tempGScore is not lower than neighborNode.g (a better path was not found)
        // end the element here if bottom is true
        } else if (tempGScore >= neighborNode.g) {
            continue;
        }
  
        // gscore = distance between the current node and the neighboring node
        neighborNode.g = tempGScore;
  

        if (this.algorithm === "A*") {
          // hscore = estimated distance from the current node to the end node.
          neighborNode.h = this.distanceFromTo(neighborNode, this.getEnd()); 
        }
  
        // f = g + h
        // lowest fscore is best path
        neighborNode.f = this.algorithm === "A*" ? (neighborNode.g + neighborNode.h) : (neighborNode.g);
  
        // the current node will be the parent of its neighbors
        neighborNode.parent = this.currentNode;
      }

      if (isNotInQueue) {
        neighborNode.seen = true;
        this.seenTotal += 1;
      }
    }
  }

  async solve() {
    if (this.start.length === 2 && this.end.length === 2 && !this.isSolving) {
      const performance = window.performance;

      const startTime = performance.now()

      this.clearPath();

      this.seenTotal += 1;

      const current = this.getStart();

      this.isSolving = true;
      this.currentNode = current;
      this.openList = [current];

      // the starting position will always be the best position
      this.currentNode.f = 0;
      this.currentNode.g = 0;
  
      while (this.openList.length !== 0 && !this.areSamePos(this.currentNode, {pos: this.end})) {
        if (this.speed !== 0) {
          let delayRes = await delay(this.speed);
        }

        if (!["Breadth First Search"].includes(this.algorithm)) {
          if (this.algorithm === "A*") {
            // a* algorithm (informed) f(n) = g(n) + h(n)
            this.currentNode = this.bestNodeChoice(this.openList, (node:NodeObj) => node.f);
          } else if (this.algorithm === "Dijkstra") {
            // Dijkstra’s algorithm (uninformed) f(n) = g(n)
            this.currentNode = this.bestNodeChoice(this.openList, (node:NodeObj) => node.g);
          }

          const posInd = this.openList.findIndex(ele => this.areSamePos(ele, this.currentNode));
          this.openList.splice(posInd, 1);
        } else {
          if (this.algorithm === "Breadth First Search") {
            this.currentNode = this.openList.shift()!;
          }
        }

        this.currentNode.closed = true;
        this.filterNeighbors();
      }
      
      this.timeTaken = Math.trunc(performance.now() - startTime);

      let currentNode = this.getEnd();

  
      while (currentNode.parent !== undefined) {
        let delayRes = await delay(10);
        currentNode = currentNode.parent;
        currentNode.final = true;
        
        this.finalTotal += 1;

        if (currentNode.weight) {
          this.totalSteps = this.totalSteps + 21;
        } else {
          this.totalSteps += 1;
        }
      }

      this.isSolving = false;    
    }
  }

  bestNodeChoice(positions:NodeObj[], determineValue:Function) {
    // pick the position with the best fScore
    let lowInd = 0;

    for (let index = 0; index < positions.length; index++) {
      if (determineValue(positions[index]) < determineValue(positions[lowInd])) { 
        lowInd = index; 
      }
    }

    return positions[lowInd];
  }

  getStart() {
    if (this.start.length === 2) {
      return this.squares[this.start[0]][this.start[1]];
    }
    return {...defaultNode, pos: []};
  }

  getEnd() {
    if (this.end.length === 2) {
      return this.squares[this.end[0]][this.end[1]];
    }
    return {...defaultNode, pos: []};
  }

  distanceFromTo(from:NodeObj, to:NodeObj) {
    return Math.abs(from.pos[0] - to.pos[0]) + Math.abs(from.pos[1] - to.pos[1]);
  }
}