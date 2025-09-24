(function applyOKLabPaletteToCSS() {
  if (!window.racerColors || !Array.isArray(window.racerColors)) {
      console.warn('racerColors not found on window, palette will not be set.');
      return;
  }
  const root = document.documentElement;
  for (let i = 0; i < window.racerColors.length; i++) {
    root.style.setProperty(`--racer-color-${i}`, window.racerColors[i]);
  }
})();

