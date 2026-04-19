import lottie, { type AnimationItem } from "lottie-web";

export type EffectName =
  | "sparkles"
  | "confetti"
  | "alert-pulse"
  | "thinking-dots"
  | "speech-pop"
  | "wave-lines";

interface LoadedEffect {
  data: object;
}

interface ActiveEffect {
  instance: AnimationItem;
  name: EffectName;
}

const EFFECT_EVENT_MAP: Record<string, { effect: EffectName; loop: boolean }> = {
  "tool.execute.after:success": { effect: "sparkles", loop: false },
  Congratulate: { effect: "confetti", loop: false },
  Alert: { effect: "alert-pulse", loop: true },
  "permission.asked": { effect: "alert-pulse", loop: true },
  Thinking: { effect: "thinking-dots", loop: true },
  Processing: { effect: "thinking-dots", loop: true },
  Greeting: { effect: "wave-lines", loop: false },
  GoodBye: { effect: "wave-lines", loop: false },
};

export class LottieEffects {
  private container: HTMLElement;
  private effects: Map<EffectName, LoadedEffect> = new Map();
  private active: ActiveEffect[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
  }

  async preload(basePath: string): Promise<void> {
    const effectNames: EffectName[] = [
      "sparkles",
      "confetti",
      "alert-pulse",
      "thinking-dots",
      "speech-pop",
      "wave-lines",
    ];

    await Promise.all(
      effectNames.map(async (name) => {
        try {
          const response = await fetch(`${basePath}/${name}.json`);
          const data = await response.json();
          this.effects.set(name, { data });
        } catch {
          console.warn(`Failed to load Lottie effect: ${name}`);
        }
      })
    );
  }

  playForEvent(eventKey: string): void {
    const mapping = EFFECT_EVENT_MAP[eventKey];
    if (!mapping) return;

    this.play(mapping.effect, mapping.loop);
  }

  playForAnimation(animationName: string): void {
    const mapping = EFFECT_EVENT_MAP[animationName];
    if (!mapping) return;

    this.play(mapping.effect, mapping.loop);
  }

  play(name: EffectName, loop = false): AnimationItem | null {
    const effect = this.effects.get(name);
    if (!effect) return null;

    const wrapper = document.createElement("div");
    wrapper.style.position = "absolute";
    wrapper.style.inset = "0";
    wrapper.style.pointerEvents = "none";
    this.container.appendChild(wrapper);

    const instance = lottie.loadAnimation({
      container: wrapper,
      renderer: "svg",
      loop,
      autoplay: true,
      animationData: effect.data,
    });

    const active: ActiveEffect = { instance, name };
    this.active.push(active);

    if (!loop) {
      instance.addEventListener("complete", () => {
        this.removeEffect(active, wrapper);
      });
    }

    return instance;
  }

  stopAll(): void {
    for (const active of [...this.active]) {
      active.instance.destroy();
    }
    this.active = [];
    // Remove all effect wrappers
    const wrappers = this.container.querySelectorAll("div");
    wrappers.forEach((w) => w.remove());
  }

  stopLooping(): void {
    for (const active of [...this.active]) {
      if (active.instance.loop) {
        active.instance.destroy();
        this.active = this.active.filter((a) => a !== active);
      }
    }
  }

  getEffect(name: EffectName): LoadedEffect | undefined {
    return this.effects.get(name);
  }

  private removeEffect(active: ActiveEffect, wrapper: HTMLElement): void {
    active.instance.destroy();
    wrapper.remove();
    this.active = this.active.filter((a) => a !== active);
  }
}
