import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  inject,
  PLATFORM_ID,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  PriceAlertService,
  PriceAlertStats,
} from '../../../core/services/price-alert.service';
import { AnalyticsService } from '../../../core/services/analytics.service';

@Component({
  selector: 'app-price-alert-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 transition-opacity"
          (click)="close()"
        ></div>

        <!-- Content -->
        <div
          class="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="alert-modal-title"
        >
          <!-- Close button -->
          <button
            type="button"
            (click)="close()"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          @if (state() === 'idle') {
            <h2 id="alert-modal-title" class="text-lg font-bold text-gray-900 pr-8">
              Get notified when {{ modelName }} drops &#x2265;5%
            </h2>
            <p class="mt-3 text-sm text-gray-600">
              Free weekly price monitoring. We'll email you when:
            </p>
            <ul class="mt-2 space-y-1.5 text-sm text-gray-600">
              <li class="flex items-center gap-2">
                <span class="text-green-600 font-semibold">&#x2193;</span>
                <span><strong class="text-gray-900">Price drops &#x2265;5%</strong> on this model</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="text-amber-600 font-semibold">&#x21C4;</span>
                <span><strong class="text-gray-900">Competitor gets &#x2265;15% cheaper</strong> (same category)</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="text-blue-600 font-semibold">&#x26A0;</span>
                <span><strong class="text-gray-900">Context limits change</strong> materially</span>
              </li>
            </ul>

            <form (submit)="$event.preventDefault(); onSubmit()" class="mt-5">
              <input
                type="email"
                placeholder="you&#64;company.com"
                [value]="email()"
                (input)="email.set($any($event.target).value.trim())"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                [class.border-green-400]="email() && isEmailValid()"
                [class.border-red-300]="email() && !isEmailValid()"
                autocomplete="email"
                required
              />
              <!-- Honeypot -->
              <input
                [value]="honeypot()"
                (input)="honeypot.set($any($event.target).value)"
                class="absolute -left-[9999px]"
                tabindex="-1"
                autocomplete="off"
              />
              <button
                type="submit"
                [disabled]="!isEmailValid()"
                class="mt-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                [class.bg-indigo-600]="isEmailValid()"
                [class.hover:bg-indigo-700]="isEmailValid()"
                [class.text-white]="isEmailValid()"
                [class.bg-gray-200]="!isEmailValid()"
                [class.text-gray-400]="!isEmailValid()"
                [class.cursor-not-allowed]="!isEmailValid()"
              >
                Get Free Price Alerts
              </button>
            </form>
            <p class="mt-3 text-xs text-gray-400 text-center">
              Double opt-in required. Unsubscribe anytime. No spam.
            </p>
          } @else if (state() === 'loading') {
            <div class="py-8 text-center">
              <div class="animate-spin w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto"></div>
              <p class="mt-4 text-sm text-gray-600">Securing your alert...</p>
            </div>
          } @else if (state() === 'success') {
            <div class="py-8 text-center">
              <div class="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              @if (successType() === 'auto-verified') {
                <h2 class="mt-4 text-lg font-bold text-gray-900">Alert activated!</h2>
                <p class="mt-2 text-sm text-gray-600">You're already verified. We'll notify you of pricing shifts.</p>
              } @else if (successType() === 'already-subscribed') {
                <h2 class="mt-4 text-lg font-bold text-gray-900">Already subscribed!</h2>
                <p class="mt-2 text-sm text-gray-600">You're tracking this model. We'll notify you of pricing shifts.</p>
              } @else {
                <h2 class="mt-4 text-lg font-bold text-gray-900">Check your email!</h2>
                <p class="mt-2 text-sm text-gray-600">We sent a verification link. Confirm to activate your alert.</p>
              }
            </div>
          } @else {
            <div class="py-8 text-center">
              <div class="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg class="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
              <h2 class="mt-4 text-lg font-bold text-gray-900">Something went wrong</h2>
              <p class="mt-2 text-sm text-gray-600">Please try again.</p>
              <button
                type="button"
                (click)="state.set('idle')"
                class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
              >
                Retry
              </button>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class PriceAlertModalComponent {
  @Input({ required: true }) modelId!: string;
  @Input({ required: true }) modelName!: string;
  @Input({ required: true }) currentPriceInput!: number;
  @Input({ required: true }) currentMonthlyCost!: number;
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  private alertService = inject(PriceAlertService);
  private analytics = inject(AnalyticsService);
  private platformId = inject(PLATFORM_ID);

  email = signal('');
  honeypot = signal('');
  state = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  successType = signal<'email-sent' | 'auto-verified' | 'already-subscribed'>('email-sent');

  isEmailValid = computed(() => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(this.email());
  });

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) this.close();
  }

  async onSubmit(): Promise<void> {
    if (!this.isEmailValid() || this.state() !== 'idle') return;
    this.state.set('loading');

    const stats: PriceAlertStats = {
      priceInput: this.currentPriceInput,
      monthlyCost: this.currentMonthlyCost,
      simulationHash: isPlatformBrowser(this.platformId)
        ? window.location.search
        : '',
    };

    const result = await this.alertService.subscribe(
      this.email(),
      this.modelId,
      stats,
      this.honeypot()
    );

    if (result.success) {
      // Track email signup conversion
      this.analytics.trackEmailSignup(this.modelId, 'model-card-bell');

      // Determine success type based on backend response
      if (result.autoVerified) {
        this.successType.set('auto-verified');
      } else if (result.alreadySubscribed) {
        this.successType.set('already-subscribed');
      } else {
        this.successType.set('email-sent');
      }
      this.state.set('success');
      setTimeout(() => this.close(), 3000);
    } else {
      this.state.set('error');
    }
  }

  close(): void {
    this.closed.emit();
    this.email.set('');
    this.honeypot.set('');
    this.state.set('idle');
  }
}
