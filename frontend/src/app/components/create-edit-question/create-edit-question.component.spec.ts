import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditQuestionComponent } from './create-edit-question.component';

describe('CreateEditQuestionComponent', () => {
  let component: CreateEditQuestionComponent;
  let fixture: ComponentFixture<CreateEditQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateEditQuestionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateEditQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
