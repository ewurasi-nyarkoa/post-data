import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ListPostComponent } from './component/list-post/list-post.component';
import { ApiClientService } from './service/post.service';
import { Post } from './models/post.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ListPostComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'post-data';
  posts: Post[] = [];
  private readonly POSTS_STATE_KEY = 'posts';

  constructor(private apiClient: ApiClientService) {}

  ngOnInit() {
    this.loadPosts();
  }

  private loadPosts(): void {
    this.apiClient.get<Post[]>(
      'https://jsonplaceholder.typicode.com/posts',
      { 
        key: 'all-posts', 
        duration: 3600000 // Cache for 1 hour
      }
    ).subscribe({
      next: (data) => {
        this.posts = data;
       
      },
      error: (error) => {
       
      }
    });
  }
}