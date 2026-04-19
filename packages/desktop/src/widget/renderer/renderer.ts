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
      startDrag?: () => void;
      moveDrag?: (x: number, y: number) => void;
      stopDrag?: () => void;
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

  // --- Click & double-click interactions ---
  const CLICK_REACTIONS = [
    { animation: "Wave", tip: "Hi there! Need anything?" },
    { animation: "Greeting", tip: "Hello again!" },
    { animation: "GetAttention", tip: "You rang?" },
    { animation: "Hearing_1", tip: "I'm listening!" },
    { animation: "LookUp", tip: "What's up?" },
    { animation: "CheckingSomething", tip: "Let me check..." },
    { animation: "IdleEyeBrowRaise", tip: "Hmm?" },
  ];

  const DBLCLICK_REACTIONS = [
    { animation: "GetWizardy", tip: "Abracadabra!" },
    { animation: "GetArtsy", tip: "Feeling creative!" },
    { animation: "EmptyTrash", tip: "Taking out the trash!" },
    { animation: "Congratulate", tip: "You're doing great!" },
    { animation: "Show", tip: "Ta-da!" },
  ];

  let clickCooldown = false;
  let clickTimer: number | null = null;
  const CLICK_COOLDOWN_MS = 1000;
  const DBLCLICK_DELAY_MS = 250;

  // Track whether an event-driven animation is playing
  let eventAnimationPlaying = false;

  canvas.addEventListener("dblclick", (e) => {
    e.preventDefault();
    // Cancel pending single-click
    if (clickTimer !== null) { clearTimeout(clickTimer); clickTimer = null; }
    if (clickCooldown || eventAnimationPlaying) return;

    clickCooldown = true;
    setTimeout(() => { clickCooldown = false; }, CLICK_COOLDOWN_MS);

    const reaction = DBLCLICK_REACTIONS[Math.floor(Math.random() * DBLCLICK_REACTIONS.length)];
    engine.play(reaction.animation, "high");
    speechBubble.show({ type: "status", text: reaction.tip });
  });

  canvas.addEventListener("click", (e) => {
    e.preventDefault();
    if (clickCooldown || eventAnimationPlaying) return;

    // Delay single-click to allow double-click detection
    if (clickTimer !== null) clearTimeout(clickTimer);
    clickTimer = window.setTimeout(() => {
      clickTimer = null;
      if (clickCooldown || eventAnimationPlaying) return;

      clickCooldown = true;
      setTimeout(() => { clickCooldown = false; }, CLICK_COOLDOWN_MS);

      const reaction = CLICK_REACTIONS[Math.floor(Math.random() * CLICK_REACTIONS.length)];
      engine.play(reaction.animation, "high");
      speechBubble.show({ type: "status", text: reaction.tip });
    }, DBLCLICK_DELAY_MS);
  });

  // --- Drag to move ---
  let dragStartPos: { x: number; y: number } | null = null;
  let isDragging = false;
  const DRAG_THRESHOLD = 5;

  canvas.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    dragStartPos = { x: e.screenX, y: e.screenY };
    isDragging = false;
  });

  window.addEventListener("mousemove", (e) => {
    if (!dragStartPos) return;

    const dx = e.screenX - dragStartPos.x;
    const dy = e.screenY - dragStartPos.y;

    if (!isDragging && Math.sqrt(dx * dx + dy * dy) >= DRAG_THRESHOLD) {
      isDragging = true;
      // Cancel any pending click
      if (clickTimer !== null) { clearTimeout(clickTimer); clickTimer = null; }
      window.clippy.startDrag?.();
      engine.play("GestureDown", "high");
    }

    if (isDragging) {
      window.clippy.moveDrag?.(e.screenX, e.screenY);
    }
  });

  window.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      window.clippy.stopDrag?.();
      engine.play("LookDown", "high").then(() => {
        engine.play("RestPose", "normal");
      });
    }
    dragStartPos = null;
  });

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

      eventAnimationPlaying = true;
      // Reset flag on idle — opencode is done, clicks allowed again
      if (event.event === "session.idle" || event.event === "session.deleted") {
        eventAnimationPlaying = false;
      }
      debouncer.debounce(event.event, mapping.priority, () => {
        // Skip no-op animations
        if (mapping.animation === "RestPose") { eventAnimationPlaying = false; return; }

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
