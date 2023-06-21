import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveQuizComponent } from './live-quiz.component';

describe('LiveQuizComponent', () => {
  let component: LiveQuizComponent;
  let fixture: ComponentFixture<LiveQuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiveQuizComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
