import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Post } from '../models/post.interface';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private postsData = new BehaviorSubject<Post[]>([]);
  readonly postData$ = this.postsData.asObservable();

  private readonly baseUrl = 'https://jsonplaceholder.typicode.com/posts';

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

  // Update local posts data
  updatePostsData(posts: Post[]): void {
    this.postsData.next(posts);
  }

}