import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PostCardComponent } from '../post-card/post-card.component';
import { PostService } from '../../service/post.service';
import { Post } from '../../models/post.interface';

@Component({
  selector: 'app-list-post',
  standalone: true,
  imports: [CommonModule, FormsModule, PostCardComponent],
  templateUrl: './list-post.component.html',
  styleUrls: ['./list-post.component.scss']
})
export class ListPostComponent implements OnInit {
  posts: Post[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;

  constructor(
    private postService: PostService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.isLoading = true;
    this.postService.getPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.postService.updatePostsData(posts);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.isLoading = false;
      }
    });
  }

  get filteredPosts(): Post[] {
    if (!this.searchTerm.trim()) {
      return this.posts;
    }
    
    const searchLower = this.searchTerm.toLowerCase();
    return this.posts.filter(post =>
      post.title.toLowerCase().includes(searchLower) ||
      post.body.toLowerCase().includes(searchLower)
    );
  }

  get uniqueUserCount(): number {
    const userIds = new Set(this.posts.map(post => post.userId));
    return userIds.size;
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
  }

  onCreateNew(): void {
    console.log('Creating new post');
    // Navigate to create post page
    // this.router.navigate(['/posts/create']);
  }

  onViewPost(post: Post): void {
    console.log('Viewing post:', post);
    // Navigate to post detail page
    this.router.navigate(['/posts', post.id]);
  }

  onEditPost(post: Post): void {
    console.log('Editing post:', post);
    // Navigate to edit post page
    // this.router.navigate(['/posts', post.id, 'edit']);
  }

  onDeletePost(id: number): void {
    this.postService.deletePost(id).subscribe({
      next: () => {
        this.posts = this.posts.filter(post => post.id !== id);
        this.postService.updatePostsData(this.posts);
        console.log('Post deleted successfully');
      },
      error: (error) => {
        console.error('Error deleting post:', error);
      }
    });
  }

  trackByPostId(index: number, post: Post): number {
    return post.id;
  }
}