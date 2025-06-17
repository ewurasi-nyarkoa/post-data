import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { PostService } from '../../service/post.service';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private postService: PostService
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

    this.postService.getPost(id).subscribe({
      next: (post) => {
        this.post = post;
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
      console.log('Editing post:', this.post);
      this.router.navigate(['/posts', this.post.id, 'edit']);
    }
  }

  onDelete(): void {
    if (!this.post) return;

    const confirmed = confirm('Are you sure you want to delete this post?');
    
    if (confirmed) {
      this.postService.deletePost(this.post.id).subscribe({
        next: () => {
          console.log('Post deleted successfully');
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

    this.postService.fetchComments(this.post.id).subscribe({
      next: (data) => {
        console.log('Comments for post:', data);
         this.comments = data;
      },
      error: (error) => {
        console.error('Error fetching comments:', error);
        alert('Failed to load comments. Please try again.');
      }
    });
  }
}