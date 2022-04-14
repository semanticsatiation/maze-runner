import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import BinaryMinHeap from 'src/modules/classes/binary-min-heap';
import { basicDirections, BFS, defaultNode, DFS, diagonals, DIJ, GBFS } from '../shared/variables';
import {NodeObj} from 'src/modules/interfaces/node-obj';
import { areSamePos } from '../maze/maze.component';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';

const delay = (delayInms:number) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(2);
    }, delayInms);
  });
};

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss', '../maze/maze.component.scss']
})

export class GridComponent implements OnInit, OnChanges {
  @Input() height:number = 10;
  @Input() width:number = 10;
  @Input() speed:number = 40;
  @Input() diagonal:boolean = false;
  @Input() currentTileType:string = "walls";
  @Input() zoom:number = 100;
  @Input() algorithm:string = "";
  @Input() universal:boolean = false;
  @Input() squares:NodeObj[][] = [];
  @Input() start:number[] = [];
  @Input() end:number[] = [];

  @Output() placeUniversalGoal = new EventEmitter<any>();
  @Output() incrementStop = new EventEmitter<any>();
  @Output() makeUniversal = new EventEmitter<any>();
  @Output() removeAlgorithm = new EventEmitter<any>();

  trash = faTrashCan;

  openList: any = new BinaryMinHeap();

  isSolving:boolean = false;

  currentNode:NodeObj = {pos: [], ...defaultNode};

  mouseIsDown = false;

  clicked:boolean = false;

  seenTotal:number = 0;

  wallsTotal:number = 0;

  seenTotalPercentage:number = 0;

  finalTotal:number = 0;

  totalSteps:number = 0;

  timeTaken:number = 0;

  resetUniversal: boolean = false;

  areSamePos = areSamePos;
  
  constructor() { }

  ngOnInit(): void {
    if (!this.universal) {
      this.createSquares();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if (changes["universal"] !== undefined && changes["universal"].previousValue === true && changes["universal"].currentValue === false) {  
      this.makeUnique();
    } else if (changes["universal"] !== undefined && changes["universal"].previousValue === false && changes["universal"].currentValue === true) {
      this.makeUniversal.emit();

      this.clearPath();
    }
  }

  makeUnique() {
    this.squares = JSON.parse(JSON.stringify(this.squares));
  }

  createSquares() {
    this.squares = [...Array(this.height)].map((item, ri) => (
      [...Array(this.width)].map((item, ci) => {
        return {...defaultNode, pos: [ri, ci]};
      })
    ));
  }

  placeGoal(node:NodeObj, goalType:string) {
    if (this.universal) {
      this.placeUniversalGoal.emit([node, goalType]);
    } else {
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
  }

  toggleTile(node:NodeObj) {
    if (!this.isSolving && (this.mouseIsDown || this.clicked) && !areSamePos(node, {pos: this.start}) && !areSamePos(node, {pos: this.end})) {

      // this is to fix the problem of the grids not staying universal after we start and end the solving process
      if (this.universal && this.resetUniversal) {
        this.makeUniversal.emit();
        this.resetUniversal = false;
      }

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
      
      this.openList = new BinaryMinHeap();
      this.currentNode = {pos: [], ...defaultNode};
      this.seenTotal = 0;
      this.finalTotal = 0;
      this.totalSteps = 0;
      this.timeTaken = 0;
      this.seenTotalPercentage = 0;
    }
  }

  calcZoom() {
    return ((this.zoom / 100) * 17) + "px";
  }

  findNeighbors(position:number[]) {
    const directions = this.diagonal ? ([...basicDirections, ...diagonals]) : (basicDirections);
    const neighbors:NodeObj[] = [];

    directions.forEach(direction => {
      const neighborPos = [(direction[0] + position[0]), (direction[1] + position[1])];

      if (neighborPos[0] >= 0 && neighborPos[0] <= (this.height - 1) && neighborPos[1] >= 0 && neighborPos[1] <= (this.width - 1)) {
        const neighborNode = this.squares[neighborPos[0]][neighborPos[1]];

        // if the neighborPos is within the maze boundaries and it is not a wall or closed, push it into the neighbors array
        if (!neighborNode.wall && !neighborNode.closed) {
          neighbors.push(neighborNode);
        }
      }
    });

    return neighbors;
  }

  async solve() {
    // this is where the universal rules fall apart since algorithms might differ between graphs
    if (this.universal) {
      this.makeUnique();
    }

    this.clearPath();

    const performance = window.performance;

    const startTime = performance.now();

    const current = this.getStart();

    // this is to take the start into account since it is never actaully seen
    this.seenTotal += 1;

    this.isSolving = true;

    this.currentNode = current;
    this.openList.push(current);

    // the starting position will always be the best position
    this.currentNode.g = 0;
    this.currentNode.h = this.distanceFromTo(this.currentNode, this.getEnd());
    this.currentNode.f = this.currentNode.g + this.currentNode.h;

    while (this.openList.priorityQueue.length !== 0 && !areSamePos(this.currentNode, {pos: this.end}) && this.isSolving) {
      if ([BFS, DFS].includes(this.algorithm)) {
        if (this.algorithm === DFS) {
          // LIFO (STACK)
          this.currentNode = this.openList.priorityQueue.pop();
        } else {
          // BFS FIFO (QUEUE)
          // very inefficient since shift modifies whole array
          this.currentNode = this.openList.priorityQueue.shift();
        }
      } else {
        this.currentNode = this.openList.pop();
      }

      this.currentNode.closed = true;
      this.filterNeighbors();

      if (this.speed !== 0) {
        let delayRes = await delay(this.speed);
      }
    }

    if (this.isSolving) {
      this.timeTaken = Math.trunc(performance.now() - startTime);

      let currentNode = this.getEnd();

  
      while (currentNode.parent !== undefined && this.isSolving) {
        currentNode = currentNode.parent;
        currentNode.final = true;
        
        this.finalTotal += 1;

        if (currentNode.weight) {
          // 21 is the cost of 1 node to another plus the weight
          this.totalSteps = this.totalSteps + 21;
        } else {
          this.totalSteps += 1;
        }
        let delayRes = await delay(10);
      }
    }

    // this will only execute if this.isSolving is already false
    // meaning the user ended the maze solving themselves 
    this.clearPath();

    this.incrementStop.emit();

    if (this.universal) {
      this.resetUniversal = true;
    }
  }

  clickToggle(node:NodeObj) {
    this.clicked = true;

    this.toggleTile(node);
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

  distanceFromTo(from:NodeObj, to:NodeObj, d1 = 1) {
    const dx = Math.abs(from.pos[0] - to.pos[0]);
    const dy = Math.abs(from.pos[1] - to.pos[1]);

    if (this.diagonal) {
      // Chebyshev distance allows movement in 8 directions when all movememnt types have the same cost
      return d1 * Math.max(dx, dy);
    } else {
      // Manhattan Distance allows movement in 4 directions (diagonals not included)
      return d1 * (dx + dy);
    }
  }

  filterNeighbors() {
    const adjacentSquares = this.findNeighbors(this.currentNode.pos);

    for (let index = 0; index < adjacentSquares.length; index++) {
      const neighborNode = adjacentSquares[index];
      const seen = neighborNode.seen;

      if (!seen) {
        neighborNode.seen = true;
        this.seenTotal += 1;

        if (![BFS, DFS].includes(this.algorithm)) {
          this.openList.push(neighborNode);
        }
      }

      if ([BFS, DFS].includes(this.algorithm)) {
        if (this.algorithm === DFS) {
          neighborNode.parent = this.currentNode;
          this.openList.priorityQueue.push(neighborNode);
        } else {
          if (!seen) {
            neighborNode.parent = this.currentNode;
            this.openList.priorityQueue.push(neighborNode);
          }
        }
      } else if (this.algorithm === GBFS) {
        const tempHScore = this.distanceFromTo(neighborNode, this.getEnd());
  
        if (!seen) {
          neighborNode.f = tempHScore;
          neighborNode.h = tempHScore;
          neighborNode.parent = this.currentNode;
        }
  
        if (tempHScore >= this.currentNode.h) {
          continue;
        }
  
        neighborNode.f = -1;
        this.openList.siftUp(this.openList.indexOf(neighborNode));
        neighborNode.f = tempHScore;
      } else {
        const weight = neighborNode.weight ? (20) : (0);
        // if the neighbor is weighted, make sure to take it into account
        // add distance from currentNode.g to the distance between currentNode and neighbor and then add the weight
        const tempGScore = this.currentNode.g + this.distanceFromTo(neighborNode, this.currentNode) + weight;
    
        // no need to update the neighborNode if the tempGScore is not lower than neighborNode.g (a better path was not found)
        // end the element here if bottom is true
        if (seen && tempGScore >= neighborNode.g + weight) {
            continue;
        }
    
        // gscore = distance between the current node and the neighboring node
        neighborNode.g = tempGScore;
    
        // hscore = estimated distance from the current node to the end node.
        neighborNode.h = this.distanceFromTo(neighborNode, this.getEnd());
        
        // f = g + h
        // lowest fscore is best path
        neighborNode.f = neighborNode.g + neighborNode.h; 
    
        if (this.algorithm === DIJ) {
          neighborNode.f = neighborNode.g;
        }
    
        // the current node will be the parent of its neighbors
        neighborNode.parent = this.currentNode;
    
        const newValue = neighborNode.f;
    
        // remove old node from priorityQueue and update
        neighborNode.f = -1;
    
        this.openList.siftUp(this.openList.indexOf(neighborNode));
    
        this.openList.pop();
    
        neighborNode.f = newValue;
    
        this.openList.push(neighborNode);
      }
    }
  }
}
