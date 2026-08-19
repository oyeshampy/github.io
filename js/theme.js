const toggles = document.querySelectorAll(".theme-toggle-input");
const toggleTargets = document.querySelectorAll(".theme-toggle-click");
const fontButtons = document.querySelectorAll(".font-size-button");
const languageToggle = document.getElementById("languageToggle");
const translatable = document.querySelectorAll("[data-i18n]");
const root = document.documentElement;

const storage = {
  get(key) {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // Preferences remain active for this page when storage is unavailable.
    }
  },
  remove(key) {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      // The system preference can still be applied without persistent storage.
    }
  },
};

const media = globalThis.matchMedia?.("(prefers-color-scheme: dark)");
const matchToTheme = (matches) => (matches ? "dark" : "light");
const systemTheme = () => (media ? matchToTheme(media.matches) : null);

const setTheme = (theme) => {
  root.dataset.theme = theme;
  toggles.forEach((input) => {
    input.checked = theme === "light";
  });
};

setTheme(storage.get("theme") || systemTheme() || "dark");

const setFontSize = (size) => {
  root.dataset.fontSize = size;
  fontButtons.forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      button.dataset.fontSize === size ? "true" : "false"
    );
  });
  storage.set("fontSize", size);
};

setFontSize(storage.get("fontSize") || "md");

const languages = globalThis.i18n || {};
const availableLanguages = Object.keys(languages);
const defaultLanguage = availableLanguages.includes("de")
  ? "de"
  : availableLanguages[0];

const setLanguage = (language) => {
  const pack = languages[language] || languages[defaultLanguage];
  if (!pack) {
    return;
  }
  const dictionary = pack.translations || {};
  translatable.forEach((element) => {
    const key = element.dataset.i18n;
    if (dictionary[key]) {
      element.innerHTML = dictionary[key];
    }
  });
  root.lang = language;
  if (languageToggle) {
    const nextLanguage = availableLanguages.find((code) => code !== language);
    if (nextLanguage) {
      const nextLabel = languages[nextLanguage].label || nextLanguage.toUpperCase();
      languageToggle.textContent = nextLabel;
      languageToggle.dataset.language = nextLanguage;
      languageToggle.setAttribute("aria-label", `Switch language to ${nextLabel}`);
    }
  }
  storage.set("language", language);
};

setLanguage(storage.get("language") || defaultLanguage);

media?.addEventListener?.("change", (event) => {
  storage.remove("theme");
  if (typeof event?.matches === "boolean") {
    setTheme(matchToTheme(event.matches));
  } else {
    setTheme(systemTheme() || "dark");
  }
});

toggles.forEach((input) => {
  input.addEventListener("change", () => {
    const current = input.checked ? "light" : "dark";
    setTheme(current);
    storage.set("theme", current);
  });
});

toggleTargets.forEach((target) => {
  target.addEventListener("click", (event) => {
    if (event.target.closest(".theme-switch")) {
      return;
    }

    const icon = event.target.closest(".theme-icon");
    const currentTheme = root.dataset.theme;

    if (icon?.dataset.themeIcon === currentTheme) {
      return;
    }

    const next = currentTheme === "light" ? "dark" : "light";
    setTheme(next);
    storage.set("theme", next);
  });
});

fontButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.fontSize) {
      setFontSize(button.dataset.fontSize);
    }
  });
});

languageToggle?.addEventListener("click", () => {
  if (languageToggle.dataset.language) {
    setLanguage(languageToggle.dataset.language);
  }
});
