import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiClientService } from '../../service/post.service';
import { Post } from '../../models/post.interface';
import { ErrorMessageComponent } from '../error-message/error-message.component';
import { API_ENDPOINTS, CACHE_KEYS, CACHE_DURATIONS } from '../../models/api-constants';

@Component({
  selector: 'app-edit-post',
  standalone: true,
  imports: [CommonModule, FormsModule, ErrorMessageComponent],
  templateUrl: './edit-post.component.html',
  styleUrl: './edit-post.component.scss'
})
export class EditPostComponent implements OnInit {
  // Public properties
  post: Post = {
    id: 0,
    userId: 1,
    title: '',
    body: ''
  };
  errors: Record<string, string> = {};
  isLoading = false;
  isSubmitting = false;
  apiError: string | null = null;
  
  // Private properties
  private isNewPost = false;

  constructor(
    private apiClient: ApiClientService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPost();
  }

  /**
   * Load post data from state or API
   */
  private loadPost(): void {
    const postIdParam = this.route.snapshot.paramMap.get('id');
    
    if (!postIdParam) {
      this.apiError = 'Post ID not found in URL';
      return;
    }

    const postId = Number(postIdParam);
    if (isNaN(postId) || postId <= 0) {
      this.apiError = 'Invalid post ID in URL';
      return;
    }

    this.isLoading = true;
    this.apiError = null;

    // Try to load from state first
    if (this.tryLoadFromState(postId)) {
      return;
    }

    // Fetch from API if not in any state
    this.fetchPostFromApi(postId);
  }

  /**
   * Try to load post from state
   */
  private tryLoadFromState(postId: number): boolean {
    // Check new posts state first (newly created posts)
    const newPost = this.apiClient.findInState<Post>(CACHE_KEYS.NEW_POSTS, postId);
    if (newPost) {
      this.post = newPost;
      this.isNewPost = true;
      this.isLoading = false;
      return true;
    }

    // Check main posts state (existing posts)
    const existingPost = this.apiClient.findInState<Post>(CACHE_KEYS.POSTS, postId);
    if (existingPost) {
      this.post = existingPost;
      this.isNewPost = false;
      this.isLoading = false;
      return true;
    }

    return false;
  }

  /**
   * Fetch post from API
   */
  private fetchPostFromApi(postId: number): void {
    this.apiClient.get<Post>(
      API_ENDPOINTS.getPost(postId),
      { 
        key: CACHE_KEYS.getPostKey(postId), 
        duration: CACHE_DURATIONS.LONG 
      },
      { 
        stateKey: CACHE_KEYS.POSTS, 
        updateState: true 
      }
    ).subscribe({
      next: (post) => {
        this.post = post;
        this.isNewPost = false;
        this.isLoading = false;
      },
      error: (error) => {
        this.apiError = this.getErrorMessage(error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Validate form fields
   */
  validateForm(): boolean {
    this.errors = {};

    if (!this.post.title.trim()) {
      this.errors['title'] = 'Title is required';
    } else if (this.post.title.length < 5) {
      this.errors['title'] = 'Title must be at least 5 characters long';
    }

    if (!this.post.body.trim()) {
      this.errors['body'] = 'Body is required';
    } else if (this.post.body.length < 10) {
      this.errors['body'] = 'Body must be at least 10 characters long';
    }

    if (this.post.userId < 1) {
      this.errors['userId'] = 'User ID must be a positive number';
    }

    return Object.keys(this.errors).length === 0;
  }

  /**
   * Format error message
   */
  private getErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'Network error - please check your connection';
    } else if (error.status >= 400 && error.status < 500) {
      return error.error?.message || `Client error: ${error.status}`;
    } else if (error.status >= 500) {
      return 'Server error - please try again later';
    }
    return error.message || 'An unexpected error occurred';
  }

  /**
   * Event Handlers
   */
  onFieldChange(field: keyof Post): void {
    if (this.errors[field]) {
      delete this.errors[field];
    }
    this.apiError = null;
  }

  onSubmit(form: NgForm): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;
    this.apiError = null;

    // Prepare cache keys to invalidate
    const cacheKeysToInvalidate = [
      CACHE_KEYS.POSTS, 
      CACHE_KEYS.NEW_POSTS, 
      CACHE_KEYS.ALL_POSTS, 
      CACHE_KEYS.getPostPageKey(1)
    ];

    this.apiClient.put<Post, Post>(
      API_ENDPOINTS.getPost(this.post.id),
      this.post,
      cacheKeysToInvalidate,
      { stateKey: CACHE_KEYS.POSTS, updateState: true }
    ).subscribe({
      next: this.handleUpdateSuccess.bind(this),
      error: this.handleUpdateError.bind(this)
    });
  }

  /**
   * Handle successful post update
   */
  private handleUpdateSuccess(updatedPost: Post): void {
    // Update the post in both state stores if needed
    if (this.apiClient.findInState(CACHE_KEYS.NEW_POSTS, updatedPost.id)) {
      this.apiClient.updateInState(CACHE_KEYS.NEW_POSTS, updatedPost);
    }
    
    // Navigate back to posts list with refresh parameter
    this.isSubmitting = false;
    this.router.navigate(['/posts'], { 
      queryParams: { refresh: 'true' } 
    });
  }

  /**
   * Handle update error
   */
  private handleUpdateError(error: any): void {
    this.apiError = this.getErrorMessage(error);
    this.isSubmitting = false;
  }

  cancel(): void {
    this.router.navigate(['/posts']);
  }
}