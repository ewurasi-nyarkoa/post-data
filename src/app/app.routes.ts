import { Routes } from '@angular/router';
// import { AppComponent } from '../app/app.component';
import { ListPostComponent } from '../app/component/list-post/list-post.component';
import { DetailPostComponent } from './component/detail-post/detail-post.component';
import { CreatePostComponent } from './component/create-post/create-post.component';
import {EditPostComponent} from './component/edit-post/edit-post.component';
// import { AuthGuard } from '../app/service/auth.guard';

export const routes:Routes = [
  { path: '', redirectTo: '/posts', pathMatch: 'full' },
  { path: 'posts', component: ListPostComponent},
  {path:'posts/create', component:CreatePostComponent},
  { path: 'posts/:id', component: DetailPostComponent},
  {path: 'posts/:id/edit',component: EditPostComponent},
  { path: '**', redirectTo: '/posts' }
];
