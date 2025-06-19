import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorMessage } from '../../service/error-handler.service';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (error) {
      <div class="error-message" [class]="'error-message--' + error.type">
        <div class="error-message__icon">
          @if (error.type === 'error') {
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          } @else if (error.type === 'warning') {
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          } @else {
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          }
        </div>
        <div class="error-message__content">
          @if (error.title) {
            <h3 class="error-message__title">{{ error.title }}</h3>
          }
          <p class="error-message__text">{{ error.message }}</p>
        </div>
      </div>
    }
  `,
  styles: [`
    .error-message {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      margin: 16px 0;

      &--error {
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #dc2626;
      }

      &--warning {
        background: #fffbeb;
        border: 1px solid #fef3c7;
        color: #d97706;
      }

      &--info {
        background: #eff6ff;
        border: 1px solid #dbeafe;
        color: #2563eb;
      }

      &__icon {
        flex-shrink: 0;
        
        svg {
          width: 20px;
          height: 20px;
        }
      }

      &__content {
        flex: 1;
      }

      &__title {
        margin: 0 0 4px;
        font-size: 14px;
        font-weight: 600;
      }

      &__text {
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
      }
    }
  `]
})
export class ErrorMessageComponent {
  @Input() error: ErrorMessage | null = null;
} 