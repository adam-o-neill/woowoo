/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#000";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#000",
    background: "#fff",
    tint: tintColorLight,
    icon: "#000",
    tabIconDefault: "#666",
    tabIconSelected: tintColorLight,
    buttonBackground: "#000",
    buttonText: "#fff",
    inputBackground: "#fff",
    inputBorder: "#000",
    inputText: "#000",
    error: "#ff0000",
  },
  dark: {
    text: "#fff",
    background: "#000",
    tint: tintColorDark,
    icon: "#fff",
    tabIconDefault: "#999",
    tabIconSelected: tintColorDark,
    buttonBackground: "#fff",
    buttonText: "#000",
    inputBackground: "#000",
    inputBorder: "#fff",
    inputText: "#fff",
    error: "#ff0000",
  },
};
