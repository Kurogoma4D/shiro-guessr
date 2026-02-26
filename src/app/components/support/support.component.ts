import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-support',
  imports: [RouterLink],
  templateUrl: './support.component.html',
  styleUrl: './support.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportComponent {}
