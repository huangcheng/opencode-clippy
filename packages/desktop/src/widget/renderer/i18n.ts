type LocaleDict = Record<string, string>;

const en: LocaleDict = {
  // Greeting
  "greeting": "Hey! Let's write some code!",

  // Event mapping tips
  "tip.session.created": "Hey! Let's write some code!",
  "tip.session.idle": "All done! Ready for more.",
  "tip.session.deleted": "See you next time!",
  "tip.session.diff": "Changes detected!",
  "tip.message.updated": "Working on it...",
  "tip.message.part.updated": "Thinking...",
  "tip.permission.asked": "I need your permission!",
  "tip.file.edited": "File saved!",
  "tip.tool.read": "Reading files...",
  "tip.tool.edit": "Making changes...",
  "tip.tool.bash": "Running command...",
  "tip.tool.default": "Working on it...",
  "tip.tool.success": "Done!",
  "tip.tool.error": "Oops, something went wrong!",
  "tip.permission.granted": "Thanks!",
  "tip.permission.denied": "Okay, I won't do that.",

  // Click reactions
  "click.wave": "Hi there! Need anything?",
  "click.greeting": "Hello again!",
  "click.attention": "You rang?",
  "click.hearing": "I'm listening!",
  "click.lookup": "What's up?",
  "click.checking": "Let me check...",
  "click.eyebrow": "Hmm?",

  // Double-click reactions
  "dblclick.wizardy": "Abracadabra!",
  "dblclick.artsy": "Feeling creative!",
  "dblclick.trash": "Taking out the trash!",
  "dblclick.congratulate": "You're doing great!",
  "dblclick.show": "Ta-da!",

  // Tips engine (proactive tips)
  "tips.repeated_errors.title": "It looks like you're running into errors!",
  "tips.repeated_errors.body": "Would you like me to suggest checking the error logs?",
  "tips.test_file.title": "It looks like you're working on tests!",
  "tips.test_file.body": "Remember to run them after making changes.",
  "tips.rapid_edits.title": "It looks like you're making lots of changes!",
  "tips.rapid_edits.body": "Don't forget to save your progress.",
  "tips.git.title": "It looks like you're working with git!",
  "tips.git.body": "Make sure to commit before switching branches.",
  "tips.idle.title": "It looks like you're thinking about where to start!",
  "tips.idle.body": "Try describing your task to OpenCode.",
  "tips.permission.title": "It looks like you're being cautious with permissions!",
  "tips.permission.body": "You can configure auto-approve for safe operations.",
  "tips.first_edit.title": "It looks like you're about to make your first change!",
  "tips.first_edit.body": "I'll keep an eye on things.",
  "tips.config.title": "It looks like you're editing configuration!",
  "tips.config.body": "Double-check for typos — config errors can be sneaky.",

  // Settings modal
  "settings.title": "Settings",
  "settings.language": "Language",
  "settings.autoStart": "Launch at Login",
  "settings.close": "Close",

  // Tray menu
  "tray.settings": "Settings",
  "tray.about": "About",
  "tray.exit": "Exit",
};

const zhCN: LocaleDict = {
  // Greeting
  "greeting": "嘿！一起写代码吧！",

  // Event mapping tips
  "tip.session.created": "嘿！一起写代码吧！",
  "tip.session.idle": "搞定了！随时准备继续。",
  "tip.session.deleted": "下次见！",
  "tip.session.diff": "检测到变更！",
  "tip.message.updated": "正在处理...",
  "tip.message.part.updated": "思考中...",
  "tip.permission.asked": "需要你的许可！",
  "tip.file.edited": "文件已保存！",
  "tip.tool.read": "正在读取文件...",
  "tip.tool.edit": "正在修改...",
  "tip.tool.bash": "正在执行命令...",
  "tip.tool.default": "正在处理...",
  "tip.tool.success": "完成！",
  "tip.tool.error": "哎呀，出了点问题！",
  "tip.permission.granted": "谢谢！",
  "tip.permission.denied": "好的，我不会那样做。",

  // Click reactions
  "click.wave": "嗨！需要帮忙吗？",
  "click.greeting": "又见面啦！",
  "click.attention": "你叫我？",
  "click.hearing": "我在听！",
  "click.lookup": "怎么了？",
  "click.checking": "让我看看...",
  "click.eyebrow": "嗯？",

  // Double-click reactions
  "dblclick.wizardy": "变！",
  "dblclick.artsy": "来点创意！",
  "dblclick.trash": "清理垃圾中！",
  "dblclick.congratulate": "你做得很棒！",
  "dblclick.show": "哒哒！",

  // Tips engine (proactive tips)
  "tips.repeated_errors.title": "看起来你遇到了一些错误！",
  "tips.repeated_errors.body": "要不要我建议检查一下错误日志？",
  "tips.test_file.title": "看起来你在写测试！",
  "tips.test_file.body": "修改后记得运行测试。",
  "tips.rapid_edits.title": "看起来你改了很多东西！",
  "tips.rapid_edits.body": "别忘了保存进度。",
  "tips.git.title": "看起来你在用 git！",
  "tips.git.body": "切换分支前记得提交。",
  "tips.idle.title": "看起来你在想从哪里开始！",
  "tips.idle.body": "试试向 OpenCode 描述你的任务。",
  "tips.permission.title": "看起来你对权限很谨慎！",
  "tips.permission.body": "你可以为安全操作配置自动批准。",
  "tips.first_edit.title": "看起来你要做第一个修改了！",
  "tips.first_edit.body": "我会盯着的。",
  "tips.config.title": "看起来你在编辑配置！",
  "tips.config.body": "仔细检查拼写——配置错误很难发现。",

  // Settings modal
  "settings.title": "设置",
  "settings.language": "语言",
  "settings.autoStart": "开机自启",
  "settings.close": "关闭",

  // Tray menu
  "tray.settings": "设置",
  "tray.about": "关于",
  "tray.exit": "退出",
};

const locales: Record<string, LocaleDict> = { en, "zh-CN": zhCN };

let currentLocale = "en";
let localeChangeCallback: (() => void) | null = null;

export function t(key: string): string {
  return locales[currentLocale]?.[key] ?? locales.en[key] ?? key;
}

export function setLocale(lang: string): void {
  if (locales[lang]) {
    currentLocale = lang;
    localeChangeCallback?.();
  }
}

export function getLocale(): string {
  return currentLocale;
}

export function onLocaleChange(callback: () => void): void {
  localeChangeCallback = callback;
}
