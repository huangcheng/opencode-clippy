export interface AnimationFrame {
  Duration: number;
  ImagesOffsets: { Column: number; Row: number } | null;
}

export interface AnimationData {
  Name: string;
  Frames: AnimationFrame[];
}

export type Priority = "high" | "normal";

interface QueuedAnimation {
  name: string;
  priority: Priority;
  resolve: () => void;
}

const FRAME_WIDTH = 124;
const FRAME_HEIGHT = 93;
const IDLE_PAUSE_MS = 3000;

// Weighted idle animation tiers — common plays ~3x more than rare
interface WeightedAnimation { name: string; weight: number; }

const IDLE_POOL: WeightedAnimation[] = [
  // Common (weight 3) — subtle idles and look-arounds
  { name: "IdleAtom", weight: 3 },
  { name: "IdleEyeBrowRaise", weight: 3 },
  { name: "IdleFingerTap", weight: 3 },
  { name: "IdleHeadScratch", weight: 3 },
  { name: "IdleRopePile", weight: 3 },
  { name: "IdleSideToSide", weight: 3 },
  { name: "IdleSnooze", weight: 3 },
  { name: "Idle1_1", weight: 3 },
  { name: "LookRight", weight: 3 },
  { name: "LookLeft", weight: 3 },
  { name: "LookUp", weight: 3 },
  { name: "LookDown", weight: 3 },
  { name: "LookUpRight", weight: 3 },
  { name: "LookUpLeft", weight: 3 },
  { name: "LookDownRight", weight: 3 },
  { name: "LookDownLeft", weight: 3 },
  { name: "Hearing_1", weight: 3 },
  { name: "CheckingSomething", weight: 3 },
  // Medium (weight 2) — expressive
  { name: "Wave", weight: 2 },
  { name: "Greeting", weight: 2 },
  { name: "GetArtsy", weight: 2 },
  { name: "GetTechy", weight: 2 },
  { name: "Thinking", weight: 2 },
  // Rare (weight 1) — dramatic
  { name: "GetWizardy", weight: 1 },
  { name: "GetAttention", weight: 1 },
  { name: "Alert", weight: 1 },
  { name: "Processing", weight: 1 },
  { name: "Congratulate", weight: 1 },
  { name: "GoodBye", weight: 1 },
  { name: "Save", weight: 1 },
  { name: "Searching", weight: 1 },
  { name: "Writing", weight: 1 },
  { name: "Explain", weight: 1 },
  { name: "Print", weight: 1 },
  { name: "SendMail", weight: 1 },
  { name: "Show", weight: 1 },
  { name: "Hide", weight: 1 },
  { name: "EmptyTrash", weight: 1 },
  { name: "GestureUp", weight: 1 },
  { name: "GestureDown", weight: 1 },
  { name: "GestureLeft", weight: 1 },
  { name: "GestureRight", weight: 1 },
];

function pickWeightedRandom(pool: WeightedAnimation[], exclude?: string): string {
  const filtered = exclude ? pool.filter((a) => a.name !== exclude) : pool;
  const totalWeight = filtered.reduce((sum, a) => sum + a.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const anim of filtered) {
    roll -= anim.weight;
    if (roll <= 0) return anim.name;
  }
  return filtered[filtered.length - 1].name;
}

export class AnimationEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private spriteSheet: HTMLImageElement;
  private animations: Map<string, AnimationFrame[]> = new Map();
  private queue: QueuedAnimation[] = [];
  private currentAnimation: string | null = null;
  private currentFrameIndex = 0;
  private frameTimer: number | null = null;
  private idleTimer: number | null = null;
  private playing = false;
  private destroyed = false;
  private lastIdleAnimation: string | null = null;

  onAnimationStart?: (name: string) => void;
  onAnimationEnd?: (name: string) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvas.width = FRAME_WIDTH;
    this.canvas.height = FRAME_HEIGHT;
    this.ctx = canvas.getContext("2d")!;
    this.spriteSheet = new Image();
  }

  async load(spriteSheetUrl: string, animationData: AnimationData[]): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.spriteSheet.onload = () => resolve();
      this.spriteSheet.onerror = reject;
      this.spriteSheet.src = spriteSheetUrl;
    });

    for (const anim of animationData) {
      this.animations.set(anim.Name, anim.Frames);
    }

    this.drawRestPose();
  }

  play(name: string, priority: Priority = "normal"): Promise<void> {
    console.log(`AnimationEngine.play("${name}", "${priority}") playing=${this.playing} current=${this.currentAnimation} queue=${this.queue.length}`);

    // Deduplicate: if this animation is already playing, don't restart it
    if (this.currentAnimation === name && this.playing) {
      return Promise.resolve();
    }

    // Deduplicate: if this animation is already the last item in the queue, skip it
    if (this.queue.length > 0 && this.queue[this.queue.length - 1].name === name) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      if (priority === "high" && this.playing) {
        this.stopCurrentAnimation();
        this.queue.unshift({ name, priority, resolve });
      } else {
        this.queue.push({ name, priority, resolve });
      }
      this.processQueue();
    });
  }

  getAnimationNames(): string[] {
    return Array.from(this.animations.keys());
  }

  destroy(): void {
    this.destroyed = true;
    this.stopCurrentAnimation();
    this.clearIdleTimer();
    this.queue = [];
  }

  private processQueue(): void {
    if (this.playing || this.queue.length === 0) return;

    const next = this.queue.shift()!;
    this.playAnimation(next.name, next.resolve);
  }

  private playAnimation(name: string, onComplete: () => void): void {
    const frames = this.animations.get(name);
    if (!frames || this.destroyed) {
      onComplete();
      return;
    }

    this.clearIdleTimer();
    this.playing = true;
    this.currentAnimation = name;
    this.currentFrameIndex = 0;
    this.onAnimationStart?.(name);

    this.playNextFrame(frames, () => {
      this.playing = false;
      this.currentAnimation = null;
      this.onAnimationEnd?.(name);
      onComplete();
      this.drawRestPose();
      this.scheduleIdleAnimation();
      this.processQueue();
    });
  }

  private playNextFrame(frames: AnimationFrame[], onComplete: () => void): void {
    if (this.destroyed || this.currentFrameIndex >= frames.length) {
      onComplete();
      return;
    }

    const frame = frames[this.currentFrameIndex];
    this.drawFrame(frame);
    this.currentFrameIndex++;

    this.frameTimer = window.setTimeout(
      () => this.playNextFrame(frames, onComplete),
      frame.Duration
    );
  }

  private drawFrame(frame: AnimationFrame): void {
    this.ctx.clearRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);

    if (frame.ImagesOffsets === null) return;

    const sx = frame.ImagesOffsets.Column * FRAME_WIDTH;
    const sy = frame.ImagesOffsets.Row * FRAME_HEIGHT;

    this.ctx.drawImage(
      this.spriteSheet,
      sx,
      sy,
      FRAME_WIDTH,
      FRAME_HEIGHT,
      0,
      0,
      FRAME_WIDTH,
      FRAME_HEIGHT
    );
  }

  private drawRestPose(): void {
    const restFrames = this.animations.get("RestPose");
    if (restFrames && restFrames.length > 0) {
      this.drawFrame(restFrames[0]);
    }
  }

  private stopCurrentAnimation(): void {
    if (this.frameTimer !== null) {
      clearTimeout(this.frameTimer);
      this.frameTimer = null;
    }
    this.playing = false;
    if (this.currentAnimation) {
      this.onAnimationEnd?.(this.currentAnimation);
    }
    this.currentAnimation = null;
    this.currentFrameIndex = 0;
  }

  private scheduleIdleAnimation(): void {
    if (this.destroyed || this.queue.length > 0) return;

    this.idleTimer = window.setTimeout(() => {
      if (this.destroyed || this.playing || this.queue.length > 0) return;
      const picked = pickWeightedRandom(IDLE_POOL, this.lastIdleAnimation ?? undefined);
      this.lastIdleAnimation = picked;
      this.play(picked, "normal");
    }, IDLE_PAUSE_MS);
  }

  private clearIdleTimer(): void {
    if (this.idleTimer !== null) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }
}
