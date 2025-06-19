import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { retry, mergeMap } from 'rxjs/operators';

export interface ErrorMessage {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; 

  constructor() {}

  handleError(error: HttpErrorResponse): Observable<never> {
    const errorMessage = this.getErrorMessage(error);
    console.error('API Error:', errorMessage);
    return throwError(() => errorMessage);
  }

  getErrorMessage(error: HttpErrorResponse): ErrorMessage {
    if (error.error instanceof ErrorEvent) {
    
      return {
        title: 'Network Error',
        message: 'Please check your internet connection and try again.',
        type: 'error'
      };
    }

   
    switch (error.status) {
      case 0:
        return {
          title: 'Server Unreachable',
          message: 'Unable to connect to the server. Please try again later.',
          type: 'error'
        };
      case 400:
        return {
          title: 'Invalid Request',
          message: 'The request was invalid. Please check your input and try again.',
          type: 'error'
        };
      case 401:
        return {
          title: 'Unauthorized',
          message: 'Please log in to continue.',
          type: 'warning'
        };
      case 403:
        return {
          title: 'Access Denied',
          message: 'You do not have permission to perform this action.',
          type: 'error'
        };
      case 422:
        return {
          title: 'Validation Error',
          message: 'Please check your input and try again.',
          type: 'warning'
        };
      case 429:
        return {
          title: 'Too Many Requests',
          message: 'Please wait a moment before trying again.',
          type: 'warning'
        };
      case 500:
        return {
          title: 'Server Error',
          message: 'An unexpected error occurred. Please try again later.',
          type: 'error'
        };
      case 503:
        return {
          title: 'Service Unavailable',
          message: 'The service is temporarily unavailable. Please try again later.',
          type: 'error'
        };
      default:
        return {
          title: 'Error',
          message: 'An unexpected error occurred. Please try again.',
          type: 'error'
        };
    }
  }

  retryStrategy<T>() {
    return (attempts: Observable<T>) => {
      return attempts.pipe(
        retry({
          count: this.maxRetries,
          delay: (error, retryCount) => timer(this.retryDelay * retryCount)
        })
      );
    };
  }

  isNetworkError(error: HttpErrorResponse): boolean {
    return error.status === 0 || error.status === 503;
  }

  isClientError(error: HttpErrorResponse): boolean {
    return error.status >= 400 && error.status < 500;
  }

  isServerError(error: HttpErrorResponse): boolean {
    return error.status >= 500;
  }
} 