import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private postsData =new BehaviorSubject<PostService[]>([]);
  readonly postData$ = this.postsData.asObservable();

  constructor(private http: HttpClient) {}
  // use the get method to fetch data from an API
  getPosts(){
    return this.http.get<PostService[]>('https://jsonplaceholder.typicode.com/posts');
  }

// use the post method to send data  to the api
postData(data:PostService[]){
  return this.http.post<PostService[]>('https://jsonplaceholder.typicode.com/posts', data);
}

// use the put method to update data in the api
  putData(id: number, data: any) {
    return this.http.put(`https://jsonplaceholder.typicode.com/posts/${id}`, data); 
  }

// use the delete method to delete data from the api
  deleteData(id: number) {  
    return this.http.delete(`https://jsonplaceholder.typicode.com/posts/${id}`);
  }

}


