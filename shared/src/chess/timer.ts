export class Timer {
  constructor(
    private timeLeft: number, //MS
    private onTimeEnd: () => void
  ) {}

  private lastTimestamp: number = 0;

  private timeout: NodeJS.Timeout | undefined;

  start() {
    this.lastTimestamp = Date.now();

    this.timeout = setTimeout(() => {
      this.onTimeEnd();
    }, this.timeLeft);
  }

  pause() {
    clearTimeout(this.timeout);
    this.timeLeft -= Date.now() - this.lastTimestamp;
  }
}
