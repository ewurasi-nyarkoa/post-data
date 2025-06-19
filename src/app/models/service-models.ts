/**
 * Configuration for cache operations
 */
export interface CacheConfig {
  key: string;
  duration?: number; // in milliseconds
}

/**
 * Error message structure
 */
export interface ErrorMessage {
  message: string;
  code?: number;
  timestamp: Date;
}

/**
 * Configuration for state management operations
 */
export interface StateConfig<T> {
  stateKey: string;
  updateState?: boolean; // whether to update local state
  addToTop?: boolean;    // whether to add new items to the top of the list
  mergeData?: boolean;   // whether to merge with existing data instead of replacing
}