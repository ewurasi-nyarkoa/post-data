import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store token on login', () => {
    service.login('admin', 'password').subscribe();
    expect(service.getToken()).toBeTruthy();
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('should remove token on logout', () => {
    service.login('admin', 'password').subscribe();
    service.logout();
    expect(service.getToken()).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should reject invalid credentials', (done) => {
    service.login('wrong', 'credentials').subscribe({
      next: () => done.fail('Should not succeed with invalid credentials'),
      error: (error) => {
        expect(error.message).toBe('Invalid credentials');
        done();
      }
    });
  });
});
