import { AnimationEngine } from "./animation-engine";
import {
  getEventMapping,
  EventDebouncer,
  type ToolEventDetail,
} from "./event-mapping";
import { SpeechBubble, type BubbleContent } from "./speech-bubble";
import { LottieEffects } from "./lottie-effects";
import animationData from "../../../assets/animations.json";

declare global {
  interface Window {
    clippy: {
      onEvent: (callback: (event: unknown) => void) => void;
    };
  }
}

interface ClippyEvent {
  type: string;
  event?: string;
  tool?: string;
  error?: boolean;
  filePath?: string;
  title?: string;
  body?: string;
  animation?: string;
}

async function init(): Promise<void> {
  console.log("Clippy renderer init starting...");

  const canvas = document.getElementById("sprite-canvas") as HTMLCanvasElement;
  const bubbleContainer = document.getElementById(
    "speech-bubble-container"
  ) as HTMLElement;
  const lottieContainer = document.getElementById(
    "lottie-overlay"
  ) as HTMLElement;

  // Initialize animation engine
  const engine = new AnimationEngine(canvas);
  const spriteUrl = new URL("../../../assets/map.png", import.meta.url).href;
  console.log("Loading sprite from:", spriteUrl);
  await engine.load(spriteUrl, animationData);
  console.log("Sprite loaded, animations:", engine.getAnimationNames().length);

  // Initialize Lottie effects (non-blocking — ok if these fail)
  const lottieEffects = new LottieEffects(lottieContainer);
  lottieEffects.preload(".").catch((e) => console.warn("Lottie preload failed:", e));

  // Initialize speech bubble
  const speechBubble = new SpeechBubble(bubbleContainer, lottieEffects);

  // Initialize debouncer (200ms to be responsive)
  const debouncer = new EventDebouncer(200);

  // Wire up animation lifecycle to Lottie effects
  engine.onAnimationStart = (name: string) => {
    lottieEffects.stopLooping();
    lottieEffects.playForAnimation(name);
  };

  engine.onAnimationEnd = () => {
    lottieEffects.stopLooping();
  };

  // Play greeting on startup so Clippy is visible immediately
  engine.play("Greeting", "high");
  speechBubble.show({ type: "status", text: "Hey! Let's write some code!" });
  console.log("Clippy renderer init complete, listening for events...");

  // Listen for events from the plugin
  window.clippy.onEvent((raw: unknown) => {
    const event = raw as ClippyEvent;
    console.log("Renderer received event:", event.type, event.event || "");

    // Handle proactive tips
    if (event.type === "tip" && event.title && event.body) {
      const content: BubbleContent = {
        type: "tip",
        title: event.title,
        body: event.body,
      };
      speechBubble.show(content);

      // Play GetAttention → Explain sequence
      engine.play(event.animation || "GetAttention", "high").then(() => {
        engine.play("Explain", "normal");
      });
      return;
    }

    // Handle regular events
    if (event.type === "event" && event.event) {
      const detail: ToolEventDetail = {
        tool: event.tool,
        error: event.error,
        filePath: event.filePath,
      };
      const mapping = getEventMapping(event.event, detail);
      console.log("Mapping:", event.event, "→", mapping.animation, "tip:", mapping.tip);

      debouncer.debounce(event.event, mapping.priority, () => {
        // Skip no-op animations
        if (mapping.animation === "RestPose") return;

        // Play animation (high priority interrupts, normal queues)
        engine.play(mapping.animation, mapping.priority);

        // Play Lottie effect for event
        if (event.event === "tool.execute.after" && !event.error) {
          lottieEffects.playForEvent("tool.execute.after:success");
        }

        // Show speech bubble only if tip is not null — don't dismiss on null
        if (mapping.tip) {
          const content: BubbleContent = {
            type: "status",
            text: mapping.tip,
          };
          speechBubble.show(content);
        }
      });
    }
  });
}

init().catch(console.error);
