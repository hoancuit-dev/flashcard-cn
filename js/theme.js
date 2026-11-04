/**
 * js/theme.js
 * Quản lý giao diện Apple Dark Mode / Light Mode.
 */
window.HSK = window.HSK || {};

function applyThemeUI(theme) {
  const isDark = theme === 'dark';
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('hsk_theme', theme);

  document.querySelectorAll('.theme-toggle-icon').forEach(icon => {
    if (isDark) {
      icon.className = 'theme-toggle-icon fa-solid fa-sun text-amber-300';
    } else {
      icon.className = 'theme-toggle-icon fa-solid fa-moon text-indigo-500';
    }
  });
}

function toggleThemeUI() {
  const isCurrentlyDark = document.documentElement.classList.contains('dark');
  applyThemeUI(isCurrentlyDark ? 'light' : 'dark');
}

function initThemeUI() {
  const savedTheme = localStorage.getItem('hsk_theme');
  if (savedTheme === 'dark' || savedTheme === 'light') {
    applyThemeUI(savedTheme);
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyThemeUI(prefersDark ? 'dark' : 'light');
  }

  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      toggleThemeUI();
    };
  });
}

// Xuất toàn cục cho toàn bộ các module script
window.applyThemeUI = applyThemeUI;
window.toggleThemeUI = toggleThemeUI;
window.initThemeUI = initThemeUI;

// Xuất vào namespace HSK
window.HSK.theme = {
  applyThemeUI,
  toggleThemeUI,
  initThemeUI
};
