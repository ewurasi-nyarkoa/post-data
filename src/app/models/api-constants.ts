
export const API_ENDPOINTS = {
  POSTS: 'https://jsonplaceholder.typicode.com/posts',
  COMMENTS: 'https://jsonplaceholder.typicode.com/comments',
  getPost: (id: number) => `https://jsonplaceholder.typicode.com/posts/${id}`,
  getPostComments: (postId: number) => `https://jsonplaceholder.typicode.com/posts/${postId}/comments`,
  deletePost: (id: number) => `https://jsonplaceholder.typicode.com/posts/${id}`
};


export const CACHE_KEYS = {
  ALL_POSTS: 'all-posts',
  POSTS: 'posts',
  NEW_POSTS: 'new-posts',
  EDITED_POSTS: 'edited-posts',
  COMMENTS: 'comments',
  getPostPageKey: (page: number) => `posts-page-${page}`,
  getPostKey: (id: number) => `post-${id}`,
  getCommentsKey: (postId: number) => `comments-${postId}`
};


export const CACHE_DURATIONS = {
  SHORT: 60000,      
  MEDIUM: 300000,    
  LONG: 3600000      
};