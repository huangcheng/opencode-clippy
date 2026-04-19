import { t, setLocale, getLocale } from "./i18n";

export class SettingsModal {
  private backdrop: HTMLElement | null = null;
  private onClose: (() => void) | null = null;

  constructor(
    private container: HTMLElement,
    private getConfig: () => Promise<Record<string, unknown>>,
    private setConfig: (partial: Record<string, unknown>) => Promise<void>,
  ) {}

  async open(): Promise<void> {
    if (this.backdrop) return;
    const config = await this.getConfig();

    this.backdrop = document.createElement("div");
    Object.assign(this.backdrop.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "transparent",
      zIndex: "200",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    });

    const modal = document.createElement("div");
    Object.assign(modal.style, {
      backgroundColor: "#FFFFE1",
      border: "1px solid #000000",
      boxShadow: "2px 2px 0px #808080",
      padding: "12px",
      fontFamily: '"Tahoma", "MS Sans Serif", sans-serif',
      fontSize: "11px",
      color: "#000000",
      minWidth: "200px",
    });

    // Title bar
    const titleBar = document.createElement("div");
    Object.assign(titleBar.style, {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "10px",
      borderBottom: "1px solid #808080",
      paddingBottom: "4px",
    });

    const title = document.createElement("span");
    title.style.fontWeight = "bold";
    title.textContent = t("settings.title");

    const closeBtn = document.createElement("span");
    Object.assign(closeBtn.style, {
      cursor: "pointer",
      fontWeight: "bold",
      padding: "0 4px",
    });
    closeBtn.textContent = "x";
    closeBtn.addEventListener("click", () => this.close());

    titleBar.appendChild(title);
    titleBar.appendChild(closeBtn);
    modal.appendChild(titleBar);

    // Language row
    const langRow = document.createElement("div");
    Object.assign(langRow.style, { marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" });

    const langLabel = document.createElement("label");
    langLabel.textContent = t("settings.language");

    const langSelect = document.createElement("select");
    Object.assign(langSelect.style, {
      fontFamily: '"Tahoma", sans-serif',
      fontSize: "11px",
      border: "1px solid #808080",
      backgroundColor: "#FFFFFF",
      padding: "1px 2px",
    });

    const optEn = document.createElement("option");
    optEn.value = "en";
    optEn.textContent = "English";
    const optZh = document.createElement("option");
    optZh.value = "zh-CN";
    optZh.textContent = "简体中文";

    langSelect.appendChild(optEn);
    langSelect.appendChild(optZh);
    langSelect.value = (config.language as string) ?? getLocale();

    langSelect.addEventListener("change", async () => {
      const lang = langSelect.value;
      setLocale(lang);
      await this.setConfig({ language: lang });
      // Update modal labels live
      title.textContent = t("settings.title");
      langLabel.textContent = t("settings.language");
      autoLabel.textContent = t("settings.autoStart");
    });

    langRow.appendChild(langLabel);
    langRow.appendChild(langSelect);
    modal.appendChild(langRow);

    // Auto-start row
    const autoRow = document.createElement("div");
    Object.assign(autoRow.style, { marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" });

    const autoCheck = document.createElement("input");
    autoCheck.type = "checkbox";
    autoCheck.checked = !!(config.autoStart);

    const autoLabel = document.createElement("label");
    autoLabel.textContent = t("settings.autoStart");
    autoLabel.style.cursor = "pointer";
    autoLabel.addEventListener("click", () => { autoCheck.click(); });

    autoCheck.addEventListener("change", async () => {
      await this.setConfig({ autoStart: autoCheck.checked });
    });

    autoRow.appendChild(autoCheck);
    autoRow.appendChild(autoLabel);
    modal.appendChild(autoRow);

    // Click outside to close
    this.backdrop.addEventListener("click", (e) => {
      if (e.target === this.backdrop) this.close();
    });

    this.backdrop.appendChild(modal);
    this.container.appendChild(this.backdrop);
  }

  close(): void {
    if (this.backdrop) {
      this.backdrop.remove();
      this.backdrop = null;
    }
    this.onClose?.();
  }

  isOpen(): boolean {
    return this.backdrop !== null;
  }
}
