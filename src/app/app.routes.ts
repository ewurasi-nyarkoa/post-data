import { Routes } from '@angular/router';
import { ListPostComponent } from '../app/component/list-post/list-post.component';
import { DetailPostComponent } from './component/detail-post/detail-post.component';
import { CreatePostComponent } from './component/create-post/create-post.component';
import {EditPostComponent} from './component/edit-post/edit-post.component';
import { LoginComponent } from './component/login/login.component';
import { AuthGuard } from './guards/auth.guard';

export const routes:Routes = [
  { path: '', redirectTo: '/posts', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'posts', component: ListPostComponent},
  {path:'posts/create', component:CreatePostComponent, canActivate:[AuthGuard]},
  { path: 'posts/:id', component: DetailPostComponent},
  {path: 'posts/:id/edit',component: EditPostComponent,canActivate:[AuthGuard]},
  { path: '**', redirectTo: '/posts' }
];
