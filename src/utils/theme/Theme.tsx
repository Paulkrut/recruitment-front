'use client';
import _ from 'lodash';
import { createTheme } from '@mui/material/styles';
import { useSelector } from '@/store/hooks';
import { useEffect } from 'react';
import { AppState } from '@/store/store';
import components from './Components';
import typography from './Typography';
import { shadows, darkshadows } from './Shadows';
import { DarkThemeColors } from './DarkThemeColors';
import { LightThemeColors } from './LightThemeColors';
import { baseDarkTheme, baselightTheme } from './DefaultColors';
import * as locales from '@mui/material/locale';

// Создаём дефолтную тему на уровне модуля для SSR
const themeOptions = LightThemeColors.find((theme) => theme.name === 'BLUE_THEME');
const baseMode = {
  palette: {
    mode: 'light' as const,
  },
  shape: {
    borderRadius: 7,
  },
  shadows: shadows,
  typography: typography,
};

const defaultThemeInstance = createTheme(
  _.merge({}, baseMode, baselightTheme, locales, themeOptions, {
    direction: 'ltr',
  }),
);
defaultThemeInstance.components = components(defaultThemeInstance);

export const BuildTheme = (config: any = {}) => {
  const themeOptions = LightThemeColors.find((theme) => theme.name === config.theme);
  const darkthemeOptions = DarkThemeColors.find((theme) => theme.name === config.theme);
  const customizer = useSelector((state: AppState) => state.customizer);
  const defaultTheme = customizer.activeMode === 'dark' ? baseDarkTheme : baselightTheme;
  const defaultShadow = customizer.activeMode === 'dark' ? darkshadows : shadows;
  const themeSelect = customizer.activeMode === 'dark' ? darkthemeOptions : themeOptions;
  const baseMode = {
    palette: {
      mode: customizer.activeMode,
    },
    shape: {
      borderRadius: customizer.borderRadius,
    },
    shadows: defaultShadow,
    typography: typography,
  };
  const theme = createTheme(
    _.merge({}, baseMode, defaultTheme, locales, themeSelect, {
      direction: config.direction,
    }),
  );
  theme.components = components(theme);

  return theme;
};

const ThemeSettings = () => {
  const activDir = useSelector((state: AppState) => state.customizer.activeDir);
  const activeTheme = useSelector((state: AppState) => state.customizer.activeTheme);
  const theme = BuildTheme({
    direction: activDir,
    theme: activeTheme,
  });
  useEffect(() => {
    document.dir = activDir;
  }, [activDir]);

  return theme;
};


export { ThemeSettings };
export default defaultThemeInstance;
