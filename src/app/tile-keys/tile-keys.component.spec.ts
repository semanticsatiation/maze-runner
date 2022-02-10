import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TileKeysComponent } from './tile-keys.component';

describe('TileKeysComponent', () => {
  let component: TileKeysComponent;
  let fixture: ComponentFixture<TileKeysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TileKeysComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TileKeysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
