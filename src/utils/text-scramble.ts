export class TextScramble {
  private el: HTMLElement;
  private chars: string;
  private queue: Array<{ from: string; to: string; start: number; end: number; char?: string }>;
  private frameRequest: number | null;
  private frame: number;
  private resolve: (() => void) | null;
  private startSpread: number;
  private minDuration: number;
  private durationSpread: number;

  constructor(el: HTMLElement, { startSpread = 20, minDuration = 20, durationSpread = 20 } = {}) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#';
    this.queue = [];
    this.frameRequest = null;
    this.frame = 0;
    this.resolve = null;
    this.startSpread = startSpread;
    this.minDuration = minDuration;
    this.durationSpread = durationSpread;
  }

  setText(newText: string): Promise<void> {
    const oldText = this.el.textContent || '';
    const length = Math.max(oldText.length, newText.length);
    this.queue = [];

    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * this.startSpread);
      const end = start + Math.floor(Math.random() * this.durationSpread) + this.minDuration;
      this.queue.push({ from, to, start, end });
    }

    if (this.frameRequest) {
      cancelAnimationFrame(this.frameRequest);
    }
    this.frame = 0;

    return new Promise((resolve) => {
      this.resolve = resolve;
      this.update();
    });
  }

  cancel(): void {
    if (this.frameRequest) {
      cancelAnimationFrame(this.frameRequest);
      this.frameRequest = null;
    }
  }

  private update(): void {
    let output = '';
    let complete = 0;

    for (let i = 0; i < this.queue.length; i++) {
      const { from, to, start, end } = this.queue[i];
      let { char } = this.queue[i];

      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += char;
      } else {
        output += from;
      }
    }

    this.el.textContent = output;

    if (complete === this.queue.length) {
      if (this.resolve) this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(() => this.update());
      this.frame++;
    }
  }
}
