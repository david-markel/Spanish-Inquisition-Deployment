import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveQuizStudentComponent } from './live-quiz-student.component';

describe('LiveQuizStudentComponent', () => {
  let component: LiveQuizStudentComponent;
  let fixture: ComponentFixture<LiveQuizStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiveQuizStudentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveQuizStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
