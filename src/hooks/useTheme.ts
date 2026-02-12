import type { ConfigProviderTheme, ConfigProviderThemeVars } from 'wot-design-uni/components/wd-config-provider/types'
import { computed, ref } from 'vue'

const STORAGE_KEY = 'app-theme'

const theme = ref<ConfigProviderTheme>('light')

function detectSystemTheme(): ConfigProviderTheme {
  try {
    const { theme: systemTheme } = uni.getSystemInfoSync() as { theme?: string }
    return systemTheme === 'dark' ? 'dark' : 'light'
  }
  catch {
    return 'light'
  }
}

function applyThemeClass(nextTheme: ConfigProviderTheme) {
  // #ifdef H5
  const root = document.documentElement
  root.classList.toggle('dark', nextTheme === 'dark')
  // #endif
}

function setTheme(nextTheme: ConfigProviderTheme) {
  theme.value = nextTheme
  uni.setStorageSync(STORAGE_KEY, nextTheme)
  applyThemeClass(nextTheme)
}

function toggleTheme() {
  setTheme(theme.value === 'dark' ? 'light' : 'dark')
}

const savedTheme = uni.getStorageSync(STORAGE_KEY) as ConfigProviderTheme | ''
setTheme(savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : detectSystemTheme())

const themeVars = computed<ConfigProviderThemeVars>(() => {
  const isDark = theme.value === 'dark'

  return {
    colorTheme: '#19E65E',
    colorSuccess: '#10B981',
    colorWarning: '#FBBF24',
    colorDanger: '#EF4444',

    colorBg: isDark ? '#102216' : '#F6F8F6',
    colorWhite: isDark ? '#1C2B21' : '#FFFFFF',
    colorTitle: isDark ? '#FFFFFF' : '#111921',
    colorContent: isDark ? '#E7F3EB' : '#1C2B21',
    colorSecondary: '#9DB8A6',
    colorAid: '#9DB9A6',
    colorBorder: isDark ? '#2A4030' : '#D9E2DC',
    colorBorderLight: isDark ? '#233328' : '#E8EFEA',

    darkBackground: '#102216',
    darkBackground2: '#1C2B21',
    darkBackground3: '#162B1E',
    darkBackground4: '#2A4030',
    darkBackground5: '#9DB8A6',
    darkBackground6: '#1A261E',
    darkBackground7: '#1A2E20',
    darkColor: '#FFFFFF',
    darkColor2: '#19E65E',
    darkColor3: '#9DB8A6',
    darkColorGray: '#9DB8A6',
    darkBorderColor: '#2A4030',

    buttonPrimaryBgColor: '#19E65E',
    buttonPrimaryColor: '#102216',
  }
})

export function useTheme() {
  return {
    theme,
    themeVars,
    setTheme,
    toggleTheme,
  }
}
