/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

import { UiTheme } from '@/constants/ui-theme';

const tintColorLight = UiTheme.colors.accent;
const tintColorDark = UiTheme.colors.accent;

export const Colors = {
  light: {
    text: UiTheme.colors.textPrimary,
    background: UiTheme.colors.page,
    tint: tintColorLight,
    icon: UiTheme.colors.textSecondary,
    tabIconDefault: UiTheme.colors.textSecondary,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: UiTheme.colors.textPrimary,
    background: UiTheme.colors.page,
    tint: tintColorDark,
    icon: UiTheme.colors.textSecondary,
    tabIconDefault: UiTheme.colors.textSecondary,
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
