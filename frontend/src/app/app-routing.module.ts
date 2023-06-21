import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LogInComponent } from './components/log-in/log-in.component';
import { JoinOrCreateComponent } from './components/join-or-create/join-or-create.component';
import { CreateUserComponent } from './components/create-user/create-user.component';
import { LiveQuizComponent } from './components/live-quiz/live-quiz.component';
import { CreateEditQuizComponent } from './components/create-edit-quiz/create-edit-quiz.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'join-or-create', pathMatch: 'full' },
  { path: 'login', component: LogInComponent },
  { path: 'join-or-create', component: JoinOrCreateComponent, canActivate: [AuthGuard] },
  { path: 'create-user', component: CreateUserComponent},
  { path: 'quiz', component: LiveQuizComponent, canActivate: [AuthGuard] },
  { path: 'create-edit-quiz/:id', component: CreateEditQuizComponent, canActivate: [AuthGuard] },
  { path: 'create-edit-quiz', component: CreateEditQuizComponent, canActivate: [AuthGuard] },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
