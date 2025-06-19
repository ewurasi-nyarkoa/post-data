// src/app/service/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  login(username: string, password: string): Observable<{token: string, user: User}> {
    // Mock login - in real app, this would call an API
    if (username === 'admin' && password === 'password') {
      const mockUser: User = { id: 1, username: 'admin', email: 'admin@example.com' };
      const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
      
      this.setSession(mockToken, mockUser);
      return of({ token: mockToken, user: mockUser });
    }
    
    return throwError(() => new Error('Invalid username or password'));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setSession(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      } catch (e) {
        this.logout();
      }
    }
  }
}
