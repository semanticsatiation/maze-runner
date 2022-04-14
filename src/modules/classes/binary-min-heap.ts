import { defaultNode } from "src/app/shared/variables";
import { NodeObj } from "../interfaces/node-obj";


export default class BinaryMinHeap {
    priorityQueue:NodeObj[] = [];
  
    size:number = 0;
  
    heapDiction:{
        [key:string]:number,
    } = {};
  
    constructor() {
    }
  
    push(node:NodeObj) {
        this.size += 1;
  
        let index = this.size - 1;
  
        this.heapDiction[node.pos.toString()] = index;
  
        this.priorityQueue[index] = node;
  
        this.siftUp(index);
    }
  
    siftUp(index:number) {
      while (index !== 0  && this.parentNode(index).f > this.priorityQueue[index].f) {
          this.swap(this.parentIndex(index), index);
          index = this.parentIndex(index);
      }
    }
  
    swap(indexOne:number, indexTwo:number) {
        const temp = this.priorityQueue[indexOne];
  
        this.heapDiction[this.priorityQueue[indexOne].pos.toString()] = indexTwo;
        this.heapDiction[this.priorityQueue[indexTwo].pos.toString()] = indexOne;
  
        this.priorityQueue[indexOne] = this.priorityQueue[indexTwo];
        this.priorityQueue[indexTwo] = temp;
    }
  
    heapify(index:number = 0) {
        const leftChildNodeIndex = this.leftChildNodeIndex(index);
        const rightChildNodeIndex = this.rightChildNodeIndex(index);
        let smallest = index;
        
        if (leftChildNodeIndex < this.size && this.priorityQueue[leftChildNodeIndex].f < this.priorityQueue[index].f) {
            smallest = leftChildNodeIndex;
        }
  
        if (rightChildNodeIndex < this.size && this.priorityQueue[rightChildNodeIndex].f < this.priorityQueue[smallest].f) {
            smallest = rightChildNodeIndex;
        }
  
        if (smallest !== index) {
            this.swap(index, smallest);
            this.heapify(smallest);
        }
    }
  
    pop() {
        if (this.size <= 0) {
          return {pos: [], ...defaultNode};
        }
  
        if (this.size === 1) {
            this.size -= 1;
            return this.priorityQueue.pop();
        }
  
  
        // min to be returned
        const root = this.priorityQueue[0];
  
        // grabbing last element so we can swap it with the front element (root)
        let temp = this.priorityQueue.pop()!;
  
        // if a node is sent to the top and is never sifted down, because it is already the min, 
        // then we need to make sure to update its index to 0 or else the position will always stay at this.size - 1
        // and the heap will think it is the last element even though that index doesnt exist anymore since we popped it
        this.heapDiction[temp.pos.toString()] = 0;
  
        this.size -= 1;
  
        // Place last element (which was popped) in at front of array
        this.priorityQueue[0] = temp!;
  
        this.heapify(0);
  
        return root;
    }
  
    parentIndex(index:number) {
        return Math.floor((index-1)/2);
    }
  
    parentNode(index:number) {
        return this.priorityQueue[this.parentIndex(index)];
    }
  
    leftChildNodeIndex(index:number) {
        return (2 * index) + 1;
    }
  
    rightChildNodeIndex(index:number) {
        return (2 * index) + 2;
    }
  
    leftChildNode(index:number) {
        return this.priorityQueue[this.leftChildNodeIndex(index)];
    }
  
    rightChildNode(index:number) {
        return this.priorityQueue[this.rightChildNodeIndex(index)];
    }
  
    indexOf(node:NodeObj) {
      return this.heapDiction[node.pos.toString()];
    }
}