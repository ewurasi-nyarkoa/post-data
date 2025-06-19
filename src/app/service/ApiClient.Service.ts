import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { CacheConfig, ErrorMessage, StateConfig } from '../models/service-models';
import { CACHE_KEYS, CACHE_DURATIONS } from '../models/api-constants';

@Injectable({
  providedIn: 'root',
})
export class ApiClientService {
  // Private properties
  private readonly defaultCacheDuration = CACHE_DURATIONS.LONG;
  private errorSubject = new BehaviorSubject<ErrorMessage | null>(null);
  private stateSubjects = new Map<string, BehaviorSubject<any>>();
  
  // Public observables
  error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}
  getState$<T>(stateKey: string): Observable<T[]> {
    return this.getStateSubject<T>(stateKey).asObservable();
  }

  setState<T>(stateKey: string, data: T[]): void {
    const subject = this.getStateSubject<T>(stateKey);
    subject.next(data);
  }

  mergeIntoState<T extends { id: number }>(stateKey: string, newData: T[]): void {
    const subject = this.getStateSubject<T>(stateKey);
    const currentData = subject.value;
 
    const existingMap = new Map(currentData.map(item => [item.id, item]));
    

    newData.forEach(newItem => {
      existingMap.set(newItem.id, newItem);
    });
    
  
    const mergedData = Array.from(existingMap.values()).sort((a, b) => b.id - a.id);
    
    subject.next(mergedData);
  }

  // Add item to state (for new items)
  addToState<T extends { id: number }>(stateKey: string, item: T, addToTop: boolean = true): void {
    const subject = this.getStateSubject<T>(stateKey);
    const currentData = subject.value;
    const newData = addToTop ? [item, ...currentData] : [...currentData, item];
    subject.next(newData);
  }

  // Update item in state
  updateInState<T extends { id: number }>(stateKey: string, updatedItem: T): void {
    const subject = this.getStateSubject<T>(stateKey);
    const currentData = subject.value;
    
    // Create a completely new array with the updated item
    const newData = currentData.map(item => {
      if (item.id === updatedItem.id) {
        return { ...updatedItem };
      }
      return { ...item }; // Create new references for all items to ensure change detection
    });
    
    // Force a new array reference to trigger change detection
    subject.next(newData);
    
    this.updateLocalCache(updatedItem);
  }

  // Remove item from state
  removeFromState<T extends { id: number }>(stateKey: string, itemId: number): void {
    const subject = this.getStateSubject<T>(stateKey);
    const currentData = subject.value;
    const newData = currentData.filter(item => item.id !== itemId);
    subject.next(newData);
  }

  // Get current state data synchronously
  getCurrentState<T>(stateKey: string): T[] {
    return this.getStateSubject<T>(stateKey).value;
  }

  // Find item by ID in state
  findInState<T extends { id: number }>(stateKey: string, itemId: number): T | undefined {
    return this.getCurrentState<T>(stateKey).find(item => item.id === itemId);
  }

  /**
   * HTTP REQUEST METHODS
   */
  
  // GET with caching support and state management
  get<T>(url: string, cacheConfig?: CacheConfig, stateConfig?: StateConfig<T>): Observable<T> {
    // Check cache first if caching is enabled
    if (cacheConfig) {
      const cachedData = this.getFromCache<T>(cacheConfig.key);
      if (cachedData) {
        // Update state if configured
        if (stateConfig?.updateState && Array.isArray(cachedData)) {
          if (stateConfig.mergeData) {
            this.mergeIntoState(stateConfig.stateKey, cachedData as any[]);
          } else {
            this.setState(stateConfig.stateKey, cachedData as any[]);
          }
        }
        // Return cached data but still make API call to refresh cache
        setTimeout(() => this.refreshCache(url, cacheConfig), 0);
        return new Observable(observer => {
          observer.next(cachedData);
          observer.complete();
        });
      }
    }

    return this.http.get<T>(url).pipe(
      tap((data) => {
        // Cache the data if caching is enabled
        if (cacheConfig) {
          this.setCache(cacheConfig.key, data, cacheConfig.duration);
        }
        // Update state if configured
        if (stateConfig?.updateState && Array.isArray(data)) {
          if (stateConfig.mergeData) {
            this.mergeIntoState(stateConfig.stateKey, data as any[]);
          } else {
            this.setState(stateConfig.stateKey, data as any[]);
          }
        }
        this.clearError();
      }),
      catchError(this.handleError('GET', url))
    );
  }

  // GET with pagination support
  getPaginated<T>(url: string, page: number = 1, limit: number = 10, cacheConfig?: CacheConfig, stateConfig?: StateConfig<T>): Observable<T> {
    const start = (page - 1) * limit;
    const params = new HttpParams()
      .set('_start', start.toString())
      .set('_limit', limit.toString());
    
    const fullUrl = `${url}?${params.toString()}`;
    const cacheKey = cacheConfig ? `${cacheConfig.key}_p${page}_l${limit}` : undefined;
    
    return this.get<T>(fullUrl, cacheKey ? { key: cacheKey, duration: cacheConfig?.duration } : undefined, stateConfig).pipe(
      tap((data: any) => this.applyLocalEdits(data, stateConfig))
    );
  }

  // POST with cache invalidation and state management
  post<T, R extends { id: number }>(url: string, body: T, cacheKeysToInvalidate?: string[], stateConfig?: StateConfig<R>): Observable<R> {
    return this.http.post<R>(url, body).pipe(
      tap((response) => {
        // Invalidate related cache entries
        if (cacheKeysToInvalidate) {
          this.invalidateCache(cacheKeysToInvalidate);
        }
        // Add to state if configured (typically for newly created items)
        if (stateConfig?.updateState) {
          this.addToState(stateConfig.stateKey, response, stateConfig.addToTop ?? true);
        }
        this.clearError();
      }),
      catchError(this.handleError('POST', url))
    );
  }

  // PUT with cache invalidation and state management
  put<T, R = T>(url: string, body: T, cacheKeysToInvalidate?: string[], stateConfig?: StateConfig<R>): Observable<R> {
    return this.http.put<R>(url, body).pipe(
      tap((response) => {
        // Store edited post in localStorage to persist changes
        if (response && typeof response === 'object' && 'id' in response) {
          this.saveEditedPost(response);
        }
        
        // Invalidate related cache entries
        if (cacheKeysToInvalidate) {
          this.invalidateCache(cacheKeysToInvalidate);
        }
        
        // Update in state if configured
        if (stateConfig?.updateState && response && typeof response === 'object' && 'id' in response) {
          this.updateInState(stateConfig.stateKey, response as any);
        }
        
        this.clearError();
      }),
      catchError(this.handleError('PUT', url))
    );
  }

  // DELETE with cache invalidation and state management
  delete(url: string, cacheKeysToInvalidate?: string[], stateConfig?: { stateKey: string; itemId: number }): Observable<void> {
    return this.http.delete<void>(url).pipe(
      tap(() => {
        // Invalidate related cache entries
        if (cacheKeysToInvalidate) {
          this.invalidateCache(cacheKeysToInvalidate);
        }
        // Remove from state if configured
        if (stateConfig) {
          this.removeFromState(stateConfig.stateKey, stateConfig.itemId);
        }
        this.clearError();
      }),
      catchError(this.handleError('DELETE', url))
    );
  }

  /**
   * CACHE MANAGEMENT METHODS
   */
  
  // Clear all cache entries
  clearAllCache(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          if (parsed.timestamp && parsed.duration) {
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        // Not a cache item, skip
      }
    });
  }

  /**
   * ERROR HANDLING METHODS
   */
  
  // Clear current error
  clearError(): void {
    this.errorSubject.next(null);
  }

  // Check if there's an active error
  hasError(): boolean {
    return this.errorSubject.value !== null;
  }

  // Get current error
  getCurrentError(): ErrorMessage | null {
    return this.errorSubject.value;
  }

  /**
   * PRIVATE HELPER METHODS
   */
  
  // Get or create a state subject
  private getStateSubject<T>(stateKey: string): BehaviorSubject<T[]> {
    if (!this.stateSubjects.has(stateKey)) {
      this.stateSubjects.set(stateKey, new BehaviorSubject<T[]>([]));
    }
    return this.stateSubjects.get(stateKey)!;
  }

  // Set cache data
  private setCache<T>(key: string, data: T, duration?: number): void {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        duration: duration || this.defaultCacheDuration
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
      
      // Set up automatic cache expiration
      setTimeout(() => {
        localStorage.removeItem(key);
      }, cacheData.duration);
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  // Get data from cache
  private getFromCache<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - cacheData.timestamp > cacheData.duration) {
        localStorage.removeItem(key);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }

  // Refresh cache in background
  private refreshCache<T>(url: string, cacheConfig: CacheConfig): void {
    this.http.get<T>(url).pipe(
      tap((data) => {
        this.setCache(cacheConfig.key, data, cacheConfig.duration);
      }),
      catchError((error) => {
        console.warn('Failed to refresh cache:', error);
        return throwError(() => error);
      })
    ).subscribe();
  }

  // Invalidate cache entries
  private invalidateCache(keys: string[]): void {
    keys.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Save edited post to localStorage
  private saveEditedPost(response: any): void {
    try {
      const editedPostsKey = CACHE_KEYS.EDITED_POSTS;
      const editedPostsJson = localStorage.getItem(editedPostsKey);
      const editedPosts = editedPostsJson ? JSON.parse(editedPostsJson) : {};
      
      const postId = response.id;
      editedPosts[postId] = response;
      
      localStorage.setItem(editedPostsKey, JSON.stringify(editedPosts));
    } catch (error) {
      console.warn('Failed to save edited post:', error);
    }
  }

  // Update local cache with edited item
  private updateLocalCache<T extends { id: number }>(updatedItem: T): void {
    try {
      // Update paginated cache
      const cacheKey = `${CACHE_KEYS.getPostPageKey(1)}_p1_l10`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const cacheData = JSON.parse(cached);
        if (cacheData.data && Array.isArray(cacheData.data)) {
          cacheData.data = cacheData.data.map((item: any) => 
            item.id === updatedItem.id ? { ...updatedItem } : item
          );
          localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        }
      }
    } catch (error) {
      console.warn('Failed to update cache:', error);
    }
  }

  // Apply local edits to data from API
  private applyLocalEdits<T>(data: any, stateConfig?: StateConfig<T>): void {
    if (!Array.isArray(data)) return;
    
    try {
      const editedPostsKey = CACHE_KEYS.EDITED_POSTS;
      const editedPostsJson = localStorage.getItem(editedPostsKey);
      const editedPosts = editedPostsJson ? JSON.parse(editedPostsJson) : {};
      
      if (Object.keys(editedPosts).length === 0) return;
      
      // Apply local edits to the data
      const updatedData = data.map((item: any) => {
        if (item.id && editedPosts[item.id]) {
          return { ...item, ...editedPosts[item.id] };
        }
        return item;
      });
      
      // Update the state with our locally edited data
      if (stateConfig?.stateKey) {
        this.setState(stateConfig.stateKey, updatedData as any[]);
      }
    } catch (error) {
      console.warn('Failed to apply local edits:', error);
    }
  }

  // Error handler factory
  private handleError(operation: string, url: string) {
    return (error: HttpErrorResponse) => {
      console.error(`${operation} request failed:`, url, error);
      const errorMessage: ErrorMessage = {
        message: this.getErrorMessage(error),
        code: error.status,
        timestamp: new Date()
      };
      this.errorSubject.next(errorMessage);
      return throwError(() => new Error(`${operation} request failed: ${errorMessage.message}`));
    };
  }

  // Format error message
  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Network error - please check your connection';
    } else if (error.status >= 400 && error.status < 500) {
      return error.error?.message || `Client error: ${error.status}`;
    } else if (error.status >= 500) {
      return 'Server error - please try again later';
    } else {
      return error.message || 'An unexpected error occurred';
    }
  }
}