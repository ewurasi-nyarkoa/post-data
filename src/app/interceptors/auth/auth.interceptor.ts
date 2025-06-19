import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../../service/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
   
    console.log(`Request: ${req.method} ${req.url}`);
    

    const token = this.authService.getToken();
    
    // Clone the request and add the token
    const authReq = token ? req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    }) : req;
    
    // Pass the cloned request to the next handler
    return next.handle(authReq).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          console.log(`Response: ${event.status} for ${req.url}`);
        }
      })
    );
  }
}
