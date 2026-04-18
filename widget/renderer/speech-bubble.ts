import type { LottieEffects } from "./lottie-effects";

export interface StatusTip {
  type: "status";
  text: string;
}

export interface ProactiveTip {
  type: "tip";
  title: string;
  body: string;
}

export type BubbleContent = StatusTip | ProactiveTip;

const STATUS_DISMISS_MS = 4000;
const TIP_DISMISS_MS = 8000;

export class SpeechBubble {
  private container: HTMLElement;
  private bubble: HTMLElement | null = null;
  private dismissTimer: number | null = null;
  private lottieEffects: LottieEffects | null = null;

  constructor(container: HTMLElement, lottieEffects?: LottieEffects) {
    this.container = container;
    this.lottieEffects = lottieEffects ?? null;
  }

  show(content: BubbleContent): void {
    this.dismiss(false);

    this.bubble = this.createBubble(content);
    this.container.appendChild(this.bubble);

    // Lottie pop-in
    this.lottieEffects?.play("speech-pop", false);

    const timeout =
      content.type === "tip" ? TIP_DISMISS_MS : STATUS_DISMISS_MS;
    this.dismissTimer = window.setTimeout(() => this.dismiss(true), timeout);
  }

  dismiss(animate = true): void {
    if (this.dismissTimer !== null) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }

    if (!this.bubble) return;

    if (animate) {
      this.lottieEffects?.play("speech-pop", false);
      const bubble = this.bubble;
      bubble.style.transition = "opacity 0.2s ease-out";
      bubble.style.opacity = "0";
      setTimeout(() => bubble.remove(), 200);
    } else {
      this.bubble.remove();
    }

    this.bubble = null;
  }

  private createBubble(content: BubbleContent): HTMLElement {
    const bubble = document.createElement("div");
    const isTip = content.type === "tip";

    // Classic Windows 98 Clippy tooltip styling
    Object.assign(bubble.style, {
      position: "absolute",
      bottom: "100px", // above Clippy sprite
      left: "8px",
      maxWidth: isTip ? "300px" : "250px",
      backgroundColor: "#FFFFE1",
      border: "1px solid #000000",
      borderRadius: "0", // sharp corners!
      boxShadow: "2px 2px 0px #808080", // Windows 98 drop shadow
      padding: "8px",
      fontFamily: '"Tahoma", "MS Sans Serif", "Microsoft Sans Serif", sans-serif',
      fontSize: "11px",
      lineHeight: "1.4",
      color: "#000000",
      cursor: "pointer",
      zIndex: "100",
      userSelect: "none",
    });

    if (isTip) {
      // Proactive tip with title + body + close button
      const header = document.createElement("div");
      header.style.display = "flex";
      header.style.justifyContent = "space-between";
      header.style.alignItems = "flex-start";

      const title = document.createElement("div");
      title.style.fontWeight = "bold";
      title.style.marginBottom = "4px";
      title.style.paddingRight = "12px";
      title.textContent = content.title;

      const closeBtn = document.createElement("span");
      Object.assign(closeBtn.style, {
        cursor: "pointer",
        fontFamily: '"Tahoma", sans-serif',
        fontSize: "11px",
        fontWeight: "bold",
        color: "#000000",
        lineHeight: "1",
        padding: "0 2px",
      });
      closeBtn.textContent = "x";
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.dismiss(true);
      });

      header.appendChild(title);
      header.appendChild(closeBtn);

      const body = document.createElement("div");
      body.textContent = content.body;

      bubble.appendChild(header);
      bubble.appendChild(body);
    } else {
      // Simple status text
      bubble.textContent = content.text;
      bubble.addEventListener("click", () => this.dismiss(true));
    }

    // Triangular tail pointing down-left toward Clippy
    const tail = document.createElement("div");
    Object.assign(tail.style, {
      position: "absolute",
      bottom: "-10px",
      left: "16px",
      width: "0",
      height: "0",
      borderLeft: "10px solid transparent",
      borderRight: "10px solid transparent",
      borderTop: "10px solid #000000",
    });

    const tailInner = document.createElement("div");
    Object.assign(tailInner.style, {
      position: "absolute",
      bottom: "-9px",
      left: "17px",
      width: "0",
      height: "0",
      borderLeft: "9px solid transparent",
      borderRight: "9px solid transparent",
      borderTop: "9px solid #FFFFE1",
    });

    bubble.appendChild(tail);
    bubble.appendChild(tailInner);

    return bubble;
  }
}
