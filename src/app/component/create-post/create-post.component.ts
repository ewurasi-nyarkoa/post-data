import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ApiClientService } from '../../service/post.service';
import { Router } from '@angular/router';

interface PostFormData {
  userId: number;
  title: string;
  body: string;
}

interface Post extends PostFormData {
  id: number;
}

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss']
})
export class CreatePostComponent {
  formData: PostFormData = {
    userId: 1,
    title: '',
    body: ''
  };

  errors: Record<string, string> = {};
  isSubmitting = false;

  // Define state and cache keys
  private readonly POSTS_STATE_KEY = 'posts';
  private readonly NEW_POSTS_STATE_KEY = 'new-posts'; // Separate state for newly created posts
  private readonly CACHE_KEYS_TO_INVALIDATE = [
    'all-posts',
    'posts-page-1',
    `user-posts-${this.formData.userId}`
  ];

  constructor(
    private apiClient: ApiClientService,
    private router: Router
  ) {}

  validateForm(): boolean {
    this.errors = {};

    if (!this.formData.title.trim()) {
      this.errors['title'] = 'Title is required';
    } else if (this.formData.title.length < 5) {
      this.errors['title'] = 'Title must be at least 5 characters long';
    }

    if (!this.formData.body.trim()) {
      this.errors['body'] = 'Body is required';
    } else if (this.formData.body.length < 10) {
      this.errors['body'] = 'Body must be at least 10 characters long';
    }

    if (this.formData.userId < 1) {
      this.errors['userId'] = 'User ID must be a positive number';
    }

    return Object.keys(this.errors).length === 0;
  }

  onFieldChange(field: keyof PostFormData): void {
    if (this.errors[field]) {
      delete this.errors[field];
    }
  }

  onSubmit(form: NgForm): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    // Generate a temporary ID for immediate UI update
    const tempId = Math.floor(Math.random() * 1000000) * -1;
    const tempPost = {
      ...this.formData,
      id: tempId // Temporary negative ID for optimistic UI update
    };

    // Optimistically update the state
    this.apiClient.addToState(this.NEW_POSTS_STATE_KEY, tempPost, true);

     this.apiClient.post<PostFormData, Post>(
      'https://jsonplaceholder.typicode.com/posts',
      this.formData,
      this.CACHE_KEYS_TO_INVALIDATE
    ).subscribe({
      next: (newPost) => {
        console.log('Post created successfully:', newPost);
        
        // Replace the temporary post with the real one from server
        this.apiClient.removeFromState(this.NEW_POSTS_STATE_KEY, tempId);
        this.apiClient.addToState(this.NEW_POSTS_STATE_KEY, {
          ...newPost,
          id: newPost.id || tempId // Fallback to tempId if API doesn't return one
        }, true);

        this.isSubmitting = false;
        this.resetForm(form);
        this.router.navigate(['/posts']);
      },
      error: (error) => {
        console.error('Error creating post:', error);
        // Remove the temporary post if creation fails
        this.apiClient.removeFromState(this.NEW_POSTS_STATE_KEY, tempId);
        this.isSubmitting = false;
        this.errors['api'] = 'Failed to create post. Please try again.';
      }
    });
  }

  resetForm(form: NgForm): void {
    form.resetForm();
    this.formData = {
      userId: 1,
      title: '',
      body: ''
    };
    this.errors = {};
  }

  cancel(): void {
    this.router.navigate(['/posts']);
  }
}