import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TileKeyLegendsComponent } from './tile-key-legends.component';

describe('TileKeyLegendsComponent', () => {
  let component: TileKeyLegendsComponent;
  let fixture: ComponentFixture<TileKeyLegendsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TileKeyLegendsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TileKeyLegendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
