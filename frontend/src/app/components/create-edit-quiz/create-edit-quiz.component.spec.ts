import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditQuizComponent } from './create-edit-quiz.component';

describe('CreateEditQuizComponent', () => {
  let component: CreateEditQuizComponent;
  let fixture: ComponentFixture<CreateEditQuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateEditQuizComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateEditQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
