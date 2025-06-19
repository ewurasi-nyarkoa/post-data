export interface CacheConfig {
  key: string;
  duration?: number; 
}
export interface ErrorMessage {
  message: string;
  code?: number;
  timestamp: Date;
}

export interface StateConfig<T> {
  stateKey: string;
  updateState?: boolean; 
  addToTop?: boolean;    
  mergeData?: boolean;   
}