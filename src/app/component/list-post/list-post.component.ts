import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { PostCardComponent } from '../post-card/post-card.component';
import { ApiClientService } from '../../service/ApiClient.Service';
import { Post } from '../../models/post.interface';
import { PaginationComponent } from '../pagination/pagination.component';
import { API_ENDPOINTS, CACHE_KEYS, CACHE_DURATIONS } from '../../models/api-constants';

@Component({
  selector: 'app-list-post',
  standalone: true,
  imports: [CommonModule, FormsModule, PostCardComponent, PaginationComponent],
  templateUrl: './list-post.component.html',
  styleUrls: ['./list-post.component.scss']
})
export class ListPostComponent implements OnInit, OnDestroy {
  // Public properties
  posts: Post[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  currentPage = 1;
  pageSize = 10;
  totalItems = 100;
  
  // Private subscriptions
  private postsSubscription!: Subscription;
  private newPostsSubscription!: Subscription;
  private queryParamsSubscription!: Subscription;

  constructor(
    private apiClient: ApiClientService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeSubscriptions();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  /**
   * Initialize all subscriptions
   */
  private initializeSubscriptions(): void {
    // Subscribe to new posts
    this.newPostsSubscription = this.apiClient.getState$<Post>(CACHE_KEYS.NEW_POSTS)
      .subscribe(() => this.updateCombinedPosts());
    
    // Subscribe to paginated posts
    this.postsSubscription = this.apiClient.getState$<Post>(CACHE_KEYS.POSTS)
      .subscribe(() => this.updateCombinedPosts());
    
    // Check if we need to force refresh (coming from edit page)
    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      const forceRefresh = !!params['refresh'];
      this.loadPosts(this.currentPage, forceRefresh);
    });
  }

  /**
   * Unsubscribe from all subscriptions
   */
  private unsubscribeAll(): void {
    if (this.postsSubscription) this.postsSubscription.unsubscribe();
    if (this.newPostsSubscription) this.newPostsSubscription.unsubscribe();
    if (this.queryParamsSubscription) this.queryParamsSubscription.unsubscribe();
  }

  /**
   * Combine posts from different sources
   */
  private updateCombinedPosts(): void {
    const newPosts = this.currentPage === 1 
      ? this.apiClient.getCurrentState<Post>(CACHE_KEYS.NEW_POSTS) 
      : [];
    const paginatedPosts = this.apiClient.getCurrentState<Post>(CACHE_KEYS.POSTS);
    
    // Create a new array reference to ensure change detection
    this.posts = [...(newPosts || []), ...(paginatedPosts || [])];
  }

  /**
   * Load posts with pagination
   */
  loadPosts(page: number = this.currentPage, forceRefresh: boolean = false): void {
    this.isLoading = true;
    this.currentPage = page;

    // Clear cache if force refresh is requested
    if (forceRefresh) {
      const cacheKey = `${CACHE_KEYS.getPostPageKey(page)}_p${page}_l${this.pageSize}`;
      localStorage.removeItem(cacheKey);
    }

    this.apiClient.getPaginated<Post>(
      API_ENDPOINTS.POSTS,
      page,
      this.pageSize,
      { 
        key: CACHE_KEYS.getPostPageKey(page), 
        duration: CACHE_DURATIONS.MEDIUM 
      },
      { 
        stateKey: CACHE_KEYS.POSTS, 
        updateState: true 
      }
    ).subscribe({
      next: () => this.isLoading = false,
      error: (error) => {
        console.error('Error loading posts:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Filter posts based on search term
   */
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

  /**
   * Count unique users in the current posts
   */
  get uniqueUserCount(): number {
    const userIds = new Set(this.posts.map(post => post.userId));
    return userIds.size;
  }

  // Event handlers
  onSearchChange(term: string): void {
    this.searchTerm = term;
  }

  onCreateNew(): void {
    this.router.navigate(['/posts/create']);
  }

  onViewPost(post: Post): void {
    this.router.navigate(['/posts', post.id]);
  }

  onEditPost(post: Post): void {
    this.router.navigate(['/posts', post.id, 'edit']);
  }

  onDeletePost(id: number): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.apiClient.delete(
        API_ENDPOINTS.deletePost(id),
        [CACHE_KEYS.getPostPageKey(this.currentPage), CACHE_KEYS.POSTS],
        { stateKey: CACHE_KEYS.POSTS, itemId: id }
      ).subscribe({
        error: (error) => console.error('Error deleting post:', error)
      });
    }
  }

  onPageChange(page: number): void {
    this.loadPosts(page);
  }

  trackByPostId(index: number, post: Post): number {
    return post.id;
  }
}