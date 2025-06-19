import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { ListPostComponent } from './list-post.component';
import { ApiClientService } from '../../service/ApiClient.Service';
import { AuthService } from '../../service/auth.service';
import { CACHE_KEYS } from '../../models/api-constants';

describe('ListPostComponent', () => {
  let component: ListPostComponent;
  let fixture: ComponentFixture<ListPostComponent>;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiClientService', 
      ['getPaginated', 'getState$', 'getCurrentState']);
    const authSpy = jasmine.createSpyObj('AuthService', 
      ['isLoggedIn', 'login', 'logout']);
    
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: ApiClientService, useValue: apiSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    apiClientSpy = TestBed.inject(ApiClientService) as jasmine.SpyObj<ApiClientService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    
   
    apiClientSpy.getPaginated.and.returnValue(of([]));
    apiClientSpy.getState$.and.returnValue(of([]));
    apiClientSpy.getCurrentState.and.returnValue([]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load posts on init', () => {
    expect(apiClientSpy.getPaginated).toHaveBeenCalled();
  });

  it('should filter posts based on search term', () => {
    const mockPosts = [
      { id: 1, userId: 1, title: 'First post', body: 'Content 1' },
      { id: 2, userId: 1, title: 'Second post', body: 'Content 2' }
    ];
    component.posts = mockPosts;
    component.searchTerm = 'first';
    
    expect(component.filteredPosts.length).toBe(1);
    expect(component.filteredPosts[0].id).toBe(1);
  });

  it('should show create button only when logged in', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    fixture.detectChanges();
    const createButton = fixture.nativeElement.querySelector('.post-list__create-btn');
    expect(createButton).toBeTruthy();
    
    authServiceSpy.isLoggedIn.and.returnValue(false);
    fixture.detectChanges();
    const noCreateButton = fixture.nativeElement.querySelector('.post-list__create-btn');
    expect(noCreateButton).toBeFalsy();
  });
});

