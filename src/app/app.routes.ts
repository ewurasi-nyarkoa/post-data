import { Routes } from '@angular/router';
// import { AppComponent } from '../app/app.component';
import { ListPostComponent } from '../app/component/list-post/list-post.component';
import { DetailPostComponent } from './component/detail-post/detail-post.component';

export const routes:Routes = [
  { path: '', redirectTo: '/posts', pathMatch: 'full' },
  { path: 'posts', component: ListPostComponent},
  { path: 'posts/:id', component: DetailPostComponent },
  { path: '**', redirectTo: '/posts' }
];
