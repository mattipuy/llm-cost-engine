import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PriceAlertService } from '../../core/services/price-alert.service';

type UnsubState = 'loading' | 'success' | 'error' | 'no-token';

@Component({
  selector: 'app-unsubscribe',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        @switch (state()) {
          @case ('loading') {
            <div class="animate-spin w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto"></div>
            <p class="mt-4 text-gray-600">Unsubscribing...</p>
          }
          @case ('success') {
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h1 class="mt-4 text-xl font-bold text-gray-900">Unsubscribed</h1>
            <p class="mt-2 text-gray-600">
              You've been removed from price alerts. You won't receive further notifications.
            </p>
            <a routerLink="/tools/chatbot-simulator"
              class="mt-6 inline-block px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              Back to LLM Cost Engine
            </a>
          }
          @case ('error') {
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </div>
            <h1 class="mt-4 text-xl font-bold text-gray-900">Unsubscribe Failed</h1>
            <p class="mt-2 text-gray-600">
              {{ errorMessage() }}
            </p>
            <a routerLink="/tools/chatbot-simulator"
              class="mt-6 inline-block px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              Back to LLM Cost Engine
            </a>
          }
          @case ('no-token') {
            <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
              <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.072 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
            <h1 class="mt-4 text-xl font-bold text-gray-900">Missing Token</h1>
            <p class="mt-2 text-gray-600">
              No unsubscribe token provided. Please use the link from your email.
            </p>
            <a routerLink="/tools/chatbot-simulator"
              class="mt-6 inline-block px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              Back to LLM Cost Engine
            </a>
          }
        }
      </div>
    </div>
  `,
})
export class UnsubscribeComponent implements OnInit {
  state = signal<UnsubState>('loading');
  errorMessage = signal('Invalid or already used unsubscribe token.');

  private alertService = inject(PriceAlertService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.state.set('loading');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      this.state.set('no-token');
      return;
    }

    this.unsubscribe(token);
  }

  private async unsubscribe(token: string): Promise<void> {
    try {
      const response = await this.alertService.unsubscribe(token);

      if (response.error) {
        this.errorMessage.set(response.error);
        this.state.set('error');
      } else {
        this.state.set('success');
      }
    } catch {
      this.errorMessage.set('Something went wrong. Please try again later.');
      this.state.set('error');
    }
  }
}
