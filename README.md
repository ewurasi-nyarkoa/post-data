# Angular Posts Manager

A modern Angular application for managing posts with authentication, caching, and state management.

## Project Description

This application demonstrates a robust Angular architecture for managing posts from JSONPlaceholder API. It features:

- Token-based authentication
- HTTP request caching
- State management
- Route protection
- Unit testing

## Setup and Run Instructions

### Prerequisites
- Node.js 
- npm 

### Installation
1. Clone the repository
   ```
   git clone https://github.com/yourusername/angular-posts-manager.git
   cd angular-posts-manager
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm start
   ```

4. Open your browser to `http://localhost:4200`

### Login Credentials
- Username: `admin`
- Password: `password`

## Available NPM Scripts

- `npm start`: Start the development server
- `npm run build`: Build the application for production
- `npm run watch`: Build and watch for changes
- `npm test`: Run unit tests
- `npm run test:coverage`: Run tests with coverage report
- `npm run lint`: Run linting
- `npm run e2e`: Run end-to-end tests

## Project Structure

```
src/
├── app/
│   ├── component/           # UI components
│   │   ├── create-post/     # Create post component
│   │   ├── detail-post/     # Post details component
│   │   ├── edit-post/       # Edit post component
│   │   ├── list-post/       # Post listing component
│   │   └── post-card/       # Reusable post card component
│   ├── guards/              # Route guards
│   │   └── auth.guard.ts    # Authentication guard
│   ├── interceptors/        # HTTP interceptors
│   │   └── auth.interceptor.ts # Authentication interceptor
│   ├── models/              # Data models
│   │   ├── api-constants.ts # API endpoints and cache keys
│   │   ├── post.interface.ts # Post model
│   │   └── service-models.ts # Service interfaces
│   ├── service/             # Services
│   │   ├── auth.service.ts  # Authentication service
│   │   └── post.service.ts  # API client service
│   ├── app.component.ts     # Root component
│   ├── app.config.ts        # App configuration
│   └── app.routes.ts        # Route definitions
└── assets/                  # Static assets
```

## Key Features

### Authentication
- Token-based authentication stored in localStorage
- Protected routes for create and edit operations
- Login/logout functionality with UI feedback

### API Client
- Centralized HTTP request handling
- Request caching with configurable durations
- Cache invalidation on data mutations
- Error handling and logging

### State Management
- BehaviorSubject-based state management
- Observable data streams
- Optimistic UI updates

### Caching
- GET requests are cached with configurable durations
- Automatic cache expiration
- Cache invalidation on POST/PUT/DELETE operations
- Local persistence of edited posts for JSONPlaceholder API

### Testing
- Unit tests for services, guards, and components
- Mocked dependencies for isolated testing
- Coverage reporting

## Notes

This application uses JSONPlaceholder as a fake REST API. Since JSONPlaceholder doesn't actually persist changes, the application implements local storage to simulate persistence between sessions.