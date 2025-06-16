import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Post } from '../../models/post.interface';

@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss']
})
export class PostCardComponent {
  @Input() post!: Post;
  @Output() view = new EventEmitter<Post>();
  @Output() edit = new EventEmitter<Post>();
  @Output() delete = new EventEmitter<number>();

  onView(): void {
    this.view.emit(this.post);
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.edit.emit(this.post);
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this post?')) {
      this.delete.emit(this.post.id);
    }
  }
}