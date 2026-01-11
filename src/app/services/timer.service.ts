import { Injectable, signal, WritableSignal } from '@angular/core';
import { interval, Subject, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

/**
 * Service for managing game timer with countdown functionality
 */
@Injectable({
  providedIn: 'root',
})
export class TimerService {
  /**
   * Current time remaining in seconds
   */
  readonly timeRemaining: WritableSignal<number> = signal(0);

  /**
   * Whether the timer is currently running
   */
  readonly isRunning: WritableSignal<boolean> = signal(false);

  /**
   * Subject that emits when the timer reaches zero
   */
  private readonly timeoutSubject = new Subject<void>();

  /**
   * Observable that emits when the timer reaches zero
   */
  readonly onTimeout$ = this.timeoutSubject.asObservable();

  /**
   * Subscription to the interval observable
   */
  private timerSubscription: Subscription | null = null;

  /**
   * Starts the timer with the specified duration
   * @param duration Duration in seconds
   */
  startTimer(duration: number): void {
    // Stop any existing timer
    this.stopTimer();

    // Set initial time
    this.timeRemaining.set(duration);
    this.isRunning.set(true);

    // Start countdown
    this.timerSubscription = interval(1000)
      .pipe(takeWhile(() => this.timeRemaining() > 0))
      .subscribe({
        next: () => {
          const remaining = this.timeRemaining() - 1;
          this.timeRemaining.set(remaining);

          // Emit timeout event when reaching zero
          if (remaining === 0) {
            this.handleTimeout();
          }
        },
      });
  }

  /**
   * Stops the timer
   */
  stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
    this.isRunning.set(false);
  }

  /**
   * Resets the timer to zero and stops it
   */
  resetTimer(): void {
    this.stopTimer();
    this.timeRemaining.set(0);
  }

  /**
   * Handles timeout event
   */
  private handleTimeout(): void {
    this.isRunning.set(false);
    this.timeoutSubject.next();
  }
}
