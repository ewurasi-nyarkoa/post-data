import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Post, Comment } from '../models/post.interface';
import { environment } from '../component/environments/environment';
// import { environmentProd } from '../component/environments/environment.production';
// import { environmentStage } from '../component/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private postsData = new BehaviorSubject<Post[]>([]);
  readonly postData$ = this.postsData.asObservable();

  private readonly baseUrl = environment.apiUrl;


//   private readonly baseUrlDevelopment = environment.apiUrl;
// private readonly baseUrlProduction = environmentProd.apiUrl;
// private readonly baseUrlStaging = environmentStage.apiUrl;


// private readonly baseUrl = environment.production ? this.baseUrlProduction : environmentStage.production ? this.baseUrlStaging : this.baseUrlDevelopment;





  constructor(private http: HttpClient) {}

  // Get posts from API
  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.baseUrl}?_start=1&_limit=10`);
  }

  // Create new post
  createPost(data: Omit<Post, 'id'>): Observable<Post> {
    return this.http.post<Post>(this.baseUrl, data);
  }

  // Update existing post
  updatePost(id: number, data: Partial<Post>): Observable<Post> {
    return this.http.put<Post>(`${this.baseUrl}/${id}`, data);
  }

  // Delete post
  deletePost(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  // Get single post
  getPost(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.baseUrl}/${id}`);
  }


  fetchComments(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseUrl}/${postId}/comments`);
  }


  // Update local posts data
  updatePostsData(posts: Post[]): void {
    this.postsData.next(posts);
  }

}