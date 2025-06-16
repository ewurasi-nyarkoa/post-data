import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OnInit } from '@angular/core';
import { PostService } from './service/post.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  title = 'post-data';
  constructor(private myHttp:PostService) {}

  // handle error gracefully in the subscription
  // and log the data to the console
  // ngOnInit() {
  //   this.myHttp.getPosts().subscribe({
  //     next: (data) => {
  //       console.log(data);
  //     },
  //     error: (error) => {
  //       console.error('Error fetching posts:', error);
  //     }
  //   });
  // }  
    ngOnInit() {
      this.myHttp.getPosts().subscribe({next:(data)=>{
        console.log(data);
        
      },
    error:(error)=>{
      console.error('Error fetching posts:', error);
    }})
  }
}
