import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinOrCreateComponent } from './join-or-create.component';

describe('JoinOrCreateComponent', () => {
  let component: JoinOrCreateComponent;
  let fixture: ComponentFixture<JoinOrCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JoinOrCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinOrCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
