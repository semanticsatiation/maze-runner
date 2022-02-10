import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TileKeyLegendComponent } from './tile-key-legend.component';

describe('TileKeyLegendComponent', () => {
  let component: TileKeyLegendComponent;
  let fixture: ComponentFixture<TileKeyLegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TileKeyLegendComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TileKeyLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
