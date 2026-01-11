import { TestBed } from '@angular/core/testing';
import { TimerService } from './timer.service';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';

describe('TimerService', () => {
  let service: TimerService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimerService);
  });

  afterEach(() => {
    // Clean up any running timers
    service.resetTimer();
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('startTimer', () => {
    it('should set initial time remaining', () => {
      service.startTimer(60);
      expect(service.timeRemaining()).toBe(60);
    });

    it('should set isRunning to true', () => {
      service.startTimer(60);
      expect(service.isRunning()).toBe(true);
    });

    it('should countdown every second', () => {
      service.startTimer(5);
      expect(service.timeRemaining()).toBe(5);

      vi.advanceTimersByTime(1000);
      expect(service.timeRemaining()).toBe(4);

      vi.advanceTimersByTime(1000);
      expect(service.timeRemaining()).toBe(3);

      vi.advanceTimersByTime(1000);
      expect(service.timeRemaining()).toBe(2);

      service.stopTimer();
    });

    it('should emit timeout event when reaching zero', () => {
      let timeoutEmitted = false;
      service.onTimeout$.subscribe(() => {
        timeoutEmitted = true;
      });

      service.startTimer(3);
      vi.advanceTimersByTime(3000);

      expect(timeoutEmitted).toBe(true);
      expect(service.timeRemaining()).toBe(0);
      expect(service.isRunning()).toBe(false);
    });

    it('should stop previous timer when starting new one', () => {
      service.startTimer(10);
      vi.advanceTimersByTime(2000);
      expect(service.timeRemaining()).toBe(8);

      // Start new timer
      service.startTimer(5);
      expect(service.timeRemaining()).toBe(5);

      vi.advanceTimersByTime(1000);
      expect(service.timeRemaining()).toBe(4);

      service.stopTimer();
    });

    it('should handle zero duration', () => {
      let timeoutEmitted = false;
      service.onTimeout$.subscribe(() => {
        timeoutEmitted = true;
      });

      service.startTimer(0);
      expect(service.timeRemaining()).toBe(0);
      expect(timeoutEmitted).toBe(false); // Timer doesn't start countdown from 0
    });
  });

  describe('stopTimer', () => {
    it('should set isRunning to false', () => {
      service.startTimer(10);
      expect(service.isRunning()).toBe(true);

      service.stopTimer();
      expect(service.isRunning()).toBe(false);
    });

    it('should stop the countdown', () => {
      service.startTimer(10);
      vi.advanceTimersByTime(2000);
      expect(service.timeRemaining()).toBe(8);

      service.stopTimer();
      const timeAfterStop = service.timeRemaining();

      vi.advanceTimersByTime(2000);
      expect(service.timeRemaining()).toBe(timeAfterStop); // Should not change
    });

    it('should not emit timeout event after stopping', () => {
      let timeoutEmitted = false;
      service.onTimeout$.subscribe(() => {
        timeoutEmitted = true;
      });

      service.startTimer(3);
      vi.advanceTimersByTime(1000);
      service.stopTimer();

      vi.advanceTimersByTime(3000);
      expect(timeoutEmitted).toBe(false);
    });

    it('should be safe to call when timer is not running', () => {
      expect(() => service.stopTimer()).not.toThrow();
    });

    it('should be safe to call multiple times', () => {
      service.startTimer(10);
      service.stopTimer();
      expect(() => service.stopTimer()).not.toThrow();
    });
  });

  describe('resetTimer', () => {
    it('should set time remaining to zero', () => {
      service.startTimer(10);
      vi.advanceTimersByTime(2000);

      service.resetTimer();
      expect(service.timeRemaining()).toBe(0);
    });

    it('should set isRunning to false', () => {
      service.startTimer(10);
      expect(service.isRunning()).toBe(true);

      service.resetTimer();
      expect(service.isRunning()).toBe(false);
    });

    it('should stop the countdown', () => {
      service.startTimer(10);
      vi.advanceTimersByTime(2000);

      service.resetTimer();
      vi.advanceTimersByTime(2000);

      expect(service.timeRemaining()).toBe(0); // Should stay at 0
    });

    it('should be safe to call when timer is not running', () => {
      expect(() => service.resetTimer()).not.toThrow();
      expect(service.timeRemaining()).toBe(0);
    });
  });

  describe('onTimeout$', () => {
    it('should emit only once when timer reaches zero', () => {
      let emissionCount = 0;
      service.onTimeout$.subscribe(() => {
        emissionCount++;
      });

      service.startTimer(2);
      vi.advanceTimersByTime(2000);

      expect(emissionCount).toBe(1);
    });

    it('should not emit when timer is stopped before timeout', () => {
      let timeoutEmitted = false;
      service.onTimeout$.subscribe(() => {
        timeoutEmitted = true;
      });

      service.startTimer(5);
      vi.advanceTimersByTime(2000);
      service.stopTimer();
      vi.advanceTimersByTime(5000);

      expect(timeoutEmitted).toBe(false);
    });

    it('should emit for each timer that completes', () => {
      let emissionCount = 0;
      service.onTimeout$.subscribe(() => {
        emissionCount++;
      });

      service.startTimer(1);
      vi.advanceTimersByTime(1000);
      expect(emissionCount).toBe(1);

      service.startTimer(1);
      vi.advanceTimersByTime(1000);
      expect(emissionCount).toBe(2);
    });
  });

  describe('integration scenarios', () => {
    it('should handle rapid start/stop cycles', () => {
      for (let i = 0; i < 5; i++) {
        service.startTimer(10);
        vi.advanceTimersByTime(500);
        service.stopTimer();
      }

      expect(service.isRunning()).toBe(false);
    });

    it('should handle multiple subscribers to onTimeout$', () => {
      let count1 = 0;
      let count2 = 0;

      service.onTimeout$.subscribe(() => count1++);
      service.onTimeout$.subscribe(() => count2++);

      service.startTimer(1);
      vi.advanceTimersByTime(1000);

      expect(count1).toBe(1);
      expect(count2).toBe(1);
    });
  });
});
