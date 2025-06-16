import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OnInit } from '@angular/core';
import { PostService } from './service/post.service';
import { ListPostComponent } from './component/list-post/list-post.component';
import { Post } from './models/post.interface';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,ListPostComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  title = 'post-data';
  posts:Post[]=[];
  constructor(private myHttp:PostService) {}

    ngOnInit() {
      this.myHttp.getPosts().subscribe({next:(data)=>{
        this.posts = data;
        console.log(data);
        
      },
    error:(error)=>{
      console.error('Error fetching posts:', error);
    }})
  }
}
