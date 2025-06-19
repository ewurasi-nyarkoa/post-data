import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CACHE_KEYS } from '../models/api-constants';
import { ApiClientService } from './ApiClient.Service';

describe('ApiClientService', () => {
  let service: ApiClientService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiClientService]
    });
    service = TestBed.inject(ApiClientService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get data from API when cache is empty', () => {
    const mockData = [{ id: 1, title: 'Test Post' }];
    
    service.get('https://jsonplaceholder.typicode.com/posts').subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should update state when configured', () => {
    const mockData = [{ id: 1, title: 'Test Post' }];
    const stateKey = 'test-state';
    
    service.get('https://jsonplaceholder.typicode.com/posts', undefined, 
      { stateKey, updateState: true }).subscribe();

    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts');
    req.flush(mockData);
    
    expect(service.getCurrentState(stateKey)).toEqual(mockData);
  });

  it('should store and retrieve data from cache', () => {
    const mockData = [{ id: 1, title: 'Test Post' }];
    const cacheKey = 'test-cache';
    
    // First request should hit API
    service.get('https://jsonplaceholder.typicode.com/posts', 
      { key: cacheKey, duration: 1000 }).subscribe();
    
    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts');
    req.flush(mockData);
    
    // Second request should use cache
    service.get('https://jsonplaceholder.typicode.com/posts', 
      { key: cacheKey, duration: 1000 }).subscribe(data => {
      expect(data).toEqual(mockData);
    });
    
    // No additional HTTP request should be made
    httpMock.expectNone('https://jsonplaceholder.typicode.com/posts');
  });
});
