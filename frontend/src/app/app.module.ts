import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';

import { AppRoutingModule } from './app-routing.module';
import { Routes, RouterModule } from '@angular/router'
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JoinOrCreateComponent } from './components/join-or-create/join-or-create.component';
import { LogInComponent } from './components/log-in/log-in.component';
import { FormsModule } from '@angular/forms';
import { CreateUserComponent } from './components/create-user/create-user.component';
import { LiveQuizComponent } from './components/live-quiz/live-quiz.component';
import { ErrorMessageComponent } from './components/error-message/error-message.component';
import { LiveQuizTeacherComponent } from './components/live-quiz-teacher/live-quiz-teacher.component';
import { LiveQuizStudentComponent } from './components/live-quiz-student/live-quiz-student.component';
import { TimerComponent } from './components/timer/timer.component';
import { CreateEditQuizComponent } from './components/create-edit-quiz/create-edit-quiz.component';
import { CreateEditQuestionComponent } from './components/create-edit-question/create-edit-question.component';

@NgModule({
  declarations: [
    AppComponent,
    JoinOrCreateComponent,
    LogInComponent,
    CreateUserComponent,
    LiveQuizComponent,
    ErrorMessageComponent,
    LiveQuizTeacherComponent,
    LiveQuizStudentComponent,
    TimerComponent, 
    CreateEditQuizComponent, CreateEditQuestionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    FormsModule, 
    FormsModule
  ],
  
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
