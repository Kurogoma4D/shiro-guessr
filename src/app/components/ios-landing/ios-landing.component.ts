import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ios-landing',
  imports: [RouterLink],
  templateUrl: './ios-landing.component.html',
  styleUrl: './ios-landing.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IosLandingComponent {}
