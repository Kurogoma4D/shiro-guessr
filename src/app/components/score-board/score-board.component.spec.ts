import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScoreBoardComponent } from './score-board.component';

describe('ScoreBoardComponent', () => {
  let component: ScoreBoardComponent;
  let fixture: ComponentFixture<ScoreBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreBoardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScoreBoardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display round progress', () => {
    fixture.componentRef.setInput('currentRound', 3);
    fixture.componentRef.setInput('totalRounds', 5);
    fixture.detectChanges();

    const roundInfo = fixture.nativeElement.querySelector('.round-info .info-value');
    expect(roundInfo.textContent.trim()).toBe('3/5');
  });

  it('should calculate progress percentage correctly', () => {
    fixture.componentRef.setInput('currentRound', 2);
    fixture.componentRef.setInput('totalRounds', 5);
    fixture.detectChanges();

    expect(component.progressPercentage()).toBe(40);
  });

  it('should display total score', () => {
    fixture.componentRef.setInput('totalScore', 2500);
    fixture.detectChanges();

    const totalScore = fixture.nativeElement.querySelector('.score-info .score-highlight');
    expect(totalScore?.textContent?.trim()).toBe('2500');
  });

  it('should calculate round completion status', () => {
    fixture.componentRef.setInput('currentScore', 850);
    fixture.detectChanges();

    expect(component.isRoundCompleted()).toBe(true);
  });

  it('should calculate round completion status as false when score is 0', () => {
    fixture.componentRef.setInput('currentScore', 0);
    fixture.detectChanges();

    expect(component.isRoundCompleted()).toBe(false);
  });

  it('should have proper ARIA attributes on progress bar', () => {
    fixture.componentRef.setInput('currentRound', 3);
    fixture.componentRef.setInput('totalRounds', 5);
    fixture.detectChanges();

    const progressBar = fixture.nativeElement.querySelector('.progress-bar-container');
    expect(progressBar.getAttribute('role')).toBe('progressbar');
    expect(progressBar.getAttribute('aria-valuenow')).toBe('3');
    expect(progressBar.getAttribute('aria-valuemin')).toBe('0');
    expect(progressBar.getAttribute('aria-valuemax')).toBe('5');
  });

  it('should handle zero total rounds without error', () => {
    fixture.componentRef.setInput('currentRound', 0);
    fixture.componentRef.setInput('totalRounds', 0);
    fixture.detectChanges();

    expect(component.progressPercentage()).toBe(0);
  });
});
