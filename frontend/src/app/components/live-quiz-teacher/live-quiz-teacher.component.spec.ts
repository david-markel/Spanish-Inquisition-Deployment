import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveQuizTeacherComponent } from './live-quiz-teacher.component';

describe('LiveQuizTeacherComponent', () => {
  let component: LiveQuizTeacherComponent;
  let fixture: ComponentFixture<LiveQuizTeacherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiveQuizTeacherComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveQuizTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
