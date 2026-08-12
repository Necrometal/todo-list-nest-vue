import { ref } from 'vue'

const STORAGE_KEY = 'theme'

function getInitial(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) return stored === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const isDark = ref(getInitial())
apply(isDark.value)

function apply(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
}

export function useDarkMode() {
  function toggle() {
    isDark.value = !isDark.value
    localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light')
    apply(isDark.value)
  }

  return { isDark, toggle }
}
