const toggles = document.querySelectorAll(".theme-toggle-input");
const toggleTargets = document.querySelectorAll(".theme-toggle-click");
const fontButtons = document.querySelectorAll(".font-size-button");
const languageSelect = document.getElementById("languageSelect");
const translatable = document.querySelectorAll("[data-i18n]");
const root = document.documentElement;

const media = globalThis.matchMedia?.("(prefers-color-scheme: dark)");
const matchToTheme = (matches) => (matches ? "dark" : "light");
const systemTheme = () => (media ? matchToTheme(media.matches) : null);

const setTheme = (theme) => {
  root.dataset.theme = theme;
  toggles.forEach((input) => {
    input.checked = theme === "light";
  });
};

setTheme(localStorage.getItem("theme") || systemTheme() || "dark");

const setFontSize = (size) => {
  root.dataset.fontSize = size;
  fontButtons.forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      button.dataset.fontSize === size ? "true" : "false"
    );
  });
  localStorage.setItem("fontSize", size);
};

setFontSize(localStorage.getItem("fontSize") || "md");

const languages = globalThis.i18n || {};
const availableLanguages = Object.keys(languages);
const defaultLanguage = availableLanguages.includes("en")
  ? "en"
  : availableLanguages[0];

if (languageSelect && availableLanguages.length > 0) {
  languageSelect.innerHTML = availableLanguages
    .map(
      (code) =>
        `<option value="${code}">${languages[code].label || code.toUpperCase()}</option>`
    )
    .join("");
}

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
  if (languageSelect) {
    languageSelect.value = language;
  }
  localStorage.setItem("language", language);
};

setLanguage(localStorage.getItem("language") || defaultLanguage);

media?.addEventListener?.("change", (event) => {
  localStorage.removeItem("theme");
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
    localStorage.setItem("theme", current);
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
    localStorage.setItem("theme", next);
  });
});

fontButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.fontSize) {
      setFontSize(button.dataset.fontSize);
    }
  });
});

languageSelect?.addEventListener("change", () => {
  if (languageSelect.value) {
    setLanguage(languageSelect.value);
  }
});
