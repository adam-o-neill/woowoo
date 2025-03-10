# WooWoo Connect - Elegant Astrology App

An elegant React Native app built with Expo, targeted at a sophisticated audience interested in astrology and self-discovery.

## Getting Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Install the Google Fonts package for Lora (our primary font)

   ```bash
   npx expo install @expo-google-fonts/lora
   ```

3. Start the app

   ```bash
   npx expo start
   ```

## Theming System

This app uses a sophisticated theming system with support for both light and dark modes. The theme is designed for an elegant, female-focused aesthetic.

### Theme Structure

- **Colors**: Located in `constants/Colors.ts`, built on a palette system
- **Typography**: Located in `constants/Typography.ts`, uses elegant font families
- **Spacing**: Located in `constants/Spacing.ts`, provides consistent spacing values
- **Theme Provider**: Context provider in `contexts/ThemeContext.tsx`

### Using the Theme

Access the theme in any component with the `useTheme` hook:

```tsx
import { useTheme } from "@/contexts/ThemeContext";

function MyComponent() {
  const { colors, spacing, theme, toggleTheme } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.background,
        padding: spacing.md,
      }}
    >
      {/* Component content */}
    </View>
  );
}
```

### Themed Components

The app includes several pre-styled components that automatically use the theme:

- `ThemedText`: Text component with variants based on Typography
- `ThemedButton`: Styled button with multiple variants
- `ThemedView`: Container with card, elevated, and default variants
- `ThemedInput`: Input fields with consistent styling
- `Section`: Content section with consistent styling

#### Example Usage

```tsx
// Example with ThemedText
<ThemedText
  variant="headingLarge"
  color="primary"
>
  Hello World
</ThemedText>

// Example with ThemedButton
<ThemedButton
  title="Press Me"
  variant="primary"
  onPress={() => console.log('Pressed')}
/>
```

### Font System

The app uses Google Fonts' Lora for an elegant typography:

- Regular weight: Main body text
- Medium weight: Secondary emphasis
- Bold weight: Headers and important content
- Italic: Quotes and special text

The font is loaded in `_layout.tsx` using Expo's Google Fonts integration.

### Color Palette

The color palette (in `constants/palette.ts`) is built around:

- **Primary**: Plum tones for sophistication
- **Secondary**: Gold tones for warmth
- **Neutral**: Gray scale for balanced design
- **Accent**: Teal and rose for highlights
- **Status**: Standard success, warning, error, info colors

## App Structure

- `app/`: Main screens and navigation using Expo Router
- `components/`: Reusable UI components
- `constants/`: Theme and other constants
- `contexts/`: Global state management
- `data/`: Static data like scenarios
- `hooks/`: Custom React hooks
- `lib/`: Utility functions and API clients

## Backend Integration

The app connects to a Node.js backend server that provides:

- Authentication and user management
- Astrological calculations and chart generation
- Daily insights and forecasts
- Scenario processing

The backend API is accessed through the API client in `lib/api/client.ts`.

## Theme Showcase

Visit the theme showcase screen at `/theme-showcase` to see all themed components in one place. This screen displays:

- Text variants
- Button styles
- Input fields
- Color palette
- Spacing and layout options

## Extending the Theme

To add new colors:

1. Update the palette in `constants/palette.ts`
2. Add the new color to both light and dark themes in `constants/Colors.ts`

To add new component variants:

1. Implement the variant in the component file
2. Update the component's props type to include the new variant

## Contributing

Refer to the file structure and existing patterns when adding new features or components. Maintain the established design system for consistency.

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
