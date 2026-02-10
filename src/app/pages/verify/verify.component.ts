import {
  Component,
  OnInit,
  signal,
  inject,
  PLATFORM_ID,
  ChangeDetectionStrategy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PriceAlertService } from '../../core/services/price-alert.service';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        @if (state() === 'loading') {
          <div class="animate-spin w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto"></div>
          <p class="mt-4 text-gray-600">Verifying your alert...</p>
        } @else if (state() === 'success') {
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h1 class="mt-4 text-xl font-bold text-gray-900">Alert Verified!</h1>
          <p class="mt-2 text-gray-600">You'll receive strategic pricing updates when significant shifts occur.</p>
          <a
            routerLink="/tools/chatbot-simulator"
            class="inline-block mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Calculator
          </a>
        } @else {
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>
          <h1 class="mt-4 text-xl font-bold text-gray-900">Token Expired or Invalid</h1>
          <p class="mt-2 text-gray-600">This verification link is no longer valid. Please subscribe again from the calculator.</p>
          <a
            routerLink="/tools/chatbot-simulator"
            class="inline-block mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Calculator
          </a>
        }
      </div>
    </div>
  `,
})
export class VerifyComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private alertService = inject(PriceAlertService);
  private platformId = inject(PLATFORM_ID);

  state = signal<'loading' | 'success' | 'error'>('loading');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.state.set('error');
      return;
    }
    if (isPlatformBrowser(this.platformId)) {
      this.verifyToken(token);
    }
  }

  private async verifyToken(token: string): Promise<void> {
    const result = await this.alertService.verify(token);
    this.state.set(result.success ? 'success' : 'error');
  }
}
