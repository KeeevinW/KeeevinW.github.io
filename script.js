(() => {
  const root = document.documentElement;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

  // Theme toggle: remembers an explicit choice, otherwise follows the system.
  const toggle = document.querySelector("[data-theme-toggle]");
  const currentTheme = () => root.dataset.theme || (systemDark.matches ? "dark" : "light");
  const syncToggleLabel = () => {
    toggle?.setAttribute("aria-label", currentTheme() === "dark" ? "Switch to light theme" : "Switch to dark theme");
  };
  toggle?.addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
    syncToggleLabel();
  });
  systemDark.addEventListener?.("change", syncToggleLabel);
  syncToggleLabel();

  // Header gets a hairline once the page scrolls.
  const header = document.querySelector(".site-header");
  const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Highlight the nav link for the section currently in view.
  const navLinks = new Map(
    [...document.querySelectorAll('.nav-links a[href^="#"]')].map((a) => [a.hash.slice(1), a])
  );
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((a) => a.removeAttribute("aria-current"));
          const link = navLinks.get(entry.target.id);
          if (!link) return;
          link.setAttribute("aria-current", "true");
          // On narrow screens the nav scrolls sideways; keep the active link centered.
          const list = link.closest(".nav-links");
          if (list.scrollWidth > list.clientWidth) {
            const listRect = list.getBoundingClientRect();
            const linkRect = link.getBoundingClientRect();
            list.scrollBy({ left: linkRect.left - listRect.left - (listRect.width - linkRect.width) / 2, behavior: "smooth" });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    navLinks.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  // Copy-to-clipboard buttons.
  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        button.textContent = "Copied";
      } catch (e) {
        button.textContent = "Copy failed";
      }
      setTimeout(() => { button.textContent = "Copy"; }, 1600);
    });
  });

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
