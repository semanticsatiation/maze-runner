import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { ASTAR, BFS, DFS, DIJ, GBFS } from '../shared/variables';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  faPlusCircle = faPlusCircle;

  algorithms = [ASTAR, BFS, DFS, DIJ, GBFS];

  @Input() menuIsOpen:boolean = false;

  @Output() addAlgorithm = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

}
