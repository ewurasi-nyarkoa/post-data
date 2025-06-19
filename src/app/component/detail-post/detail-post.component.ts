import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiClientService } from '../../service/ApiClient.Service';
import { Post, Comment } from '../../models/post.interface';

@Component({
  selector: 'app-detail-post',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-post.component.html',
  styleUrls: ['./detail-post.component.scss']
})
export class DetailPostComponent implements OnInit {
  post: Post | null = null;
  isLoading: boolean = true;
  error: string | null = null;
  comments: Comment[] = [];


  private readonly POSTS_STATE_KEY = 'posts';
  private readonly COMMENTS_STATE_KEY = 'comments';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private apiClient: ApiClientService
  ) {}

  ngOnInit(): void {
    this.loadPost();
  }

  private loadPost(): void {
    const postId = this.route.snapshot.paramMap.get('id');
    
    if (!postId) {
      this.error = 'Post ID not found';
      this.isLoading = false;
      return;
    }

    const id = parseInt(postId, 10);
    
    if (isNaN(id)) {
      this.error = 'Invalid post ID';
      this.isLoading = false;
      return;
    }

    const cachedPost = this.apiClient.findInState<Post>(this.POSTS_STATE_KEY, id);
    if (cachedPost) {
      this.post = cachedPost;
      this.isLoading = false;
      this.fetchComments();
      return;
    }

  
    this.apiClient.get<Post>(
      `https://jsonplaceholder.typicode.com/posts/${id}`,
      { key: `post-${id}`, duration: 3600000 }, 
      { stateKey: this.POSTS_STATE_KEY, updateState: true }
    ).subscribe({
      next: (post) => {
        this.post = post;
        this.fetchComments();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading post:', error);
        this.error = 'Failed to load post';
        this.isLoading = false;
      }
    });
  }

  onBack(): void {
    this.location.back();
  }

  onEdit(): void {
    if (this.post) {
      this.router.navigate(['/posts', this.post.id, 'edit']);
    }
  }

  onDelete(): void {
    if (!this.post) return;

    const confirmed = confirm('Are you sure you want to delete this post?');
    
    if (confirmed) {
      this.apiClient.delete(
        `https://jsonplaceholder.typicode.com/posts/${this.post.id}`,
        [this.POSTS_STATE_KEY],
        { stateKey: this.POSTS_STATE_KEY, itemId: this.post.id } 
      ).subscribe({
        next: () => {
          alert('Post deleted successfully');
          this.router.navigate(['/posts']);
        },
        error: (error) => {
          console.error('Error deleting post:', error);
          alert('Failed to delete post. Please try again.');
        }
      });
    }
  }

  formatTitle(title: string): string {
    return title.replace(/\b\w/g, char => char.toUpperCase());
  }

  fetchComments(): void {
    if (!this.post) return;

    this.apiClient.get<Comment[]>(
      `https://jsonplaceholder.typicode.com/posts/${this.post.id}/comments`,
      { key: `comments-${this.post.id}`, duration: 1800000 }, 
      { stateKey: this.COMMENTS_STATE_KEY, updateState: true }
    ).subscribe({
      next: (data) => {
        this.comments = data;
      },
      error: (error) => {
        console.error('Error fetching comments:', error);
        alert('Failed to load comments. Please try again.');
      }
    });
  }
}