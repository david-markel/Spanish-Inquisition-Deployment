import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent {
  @Input() max!: number;
  current: number;
  lastTime: number;
  timer: any;

  constructor() {
    this.lastTime = Date.now();
    this.current = 0;

    this.timer = setInterval(() => {
      const now = Date.now();
      this.current += (now - this.lastTime);
      this.lastTime = now;
    }, 50);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  widthStyle() {
    if (this.current >= this.max) return "width: 100%;";

    return `width: ${this.current / this.max * 100}%;`;
  }
}
