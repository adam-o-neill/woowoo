import React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemedText } from "@/components/ThemedText";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedInput } from "@/components/ThemedInput";
import { Ionicons } from "@expo/vector-icons";

export default function ThemeShowcaseScreen() {
  const { colors, spacing, theme, toggleTheme } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <ThemedText variant="displayMedium" align="center">
        Theme Showcase
      </ThemedText>

      <View style={{ height: spacing.xl }} />

      <Section title="Typography">
        <ThemedText variant="displayLarge">Display Large</ThemedText>
        <ThemedText variant="displayMedium">Display Medium</ThemedText>
        <ThemedText variant="displaySmall">Display Small</ThemedText>

        <View style={{ height: spacing.md }} />

        <ThemedText variant="headingLarge">Heading Large</ThemedText>
        <ThemedText variant="headingMedium">Heading Medium</ThemedText>
        <ThemedText variant="headingSmall">Heading Small</ThemedText>

        <View style={{ height: spacing.md }} />

        <ThemedText variant="bodyLarge">Body Large Text</ThemedText>
        <ThemedText variant="bodyMedium">Body Medium Text</ThemedText>
        <ThemedText variant="bodySmall">Body Small Text</ThemedText>

        <View style={{ height: spacing.md }} />

        <ThemedText variant="labelLarge">Label Large</ThemedText>
        <ThemedText variant="labelMedium">Label Medium</ThemedText>
        <ThemedText variant="labelSmall">Label Small</ThemedText>

        <View style={{ height: spacing.md }} />

        <ThemedText variant="quote">
          "Elegance is the only beauty that never fades." — Audrey Hepburn
        </ThemedText>

        <ThemedText variant="caption">Photo caption or small print</ThemedText>
      </Section>

      <Section title="Colors">
        <ColorSwatch name="Primary" color={colors.primary} />
        <ColorSwatch name="Primary Light" color={colors.primaryLight} />
        <ColorSwatch name="Primary Dark" color={colors.primaryDark} />
        <ColorSwatch name="Secondary" color={colors.secondary} />
        <ColorSwatch name="Secondary Light" color={colors.secondaryLight} />
        <ColorSwatch name="Secondary Dark" color={colors.secondaryDark} />
        <ColorSwatch name="Background" color={colors.background} />
        <ColorSwatch
          name="Background Secondary"
          color={colors.backgroundSecondary}
        />
        <ColorSwatch name="Text" color={colors.text} />
        <ColorSwatch name="Text Secondary" color={colors.textSecondary} />
        <ColorSwatch name="Border" color={colors.border} />
        <ColorSwatch name="Success" color={colors.success} />
        <ColorSwatch name="Error" color={colors.error} />
        <ColorSwatch name="Warning" color={colors.warning} />
        <ColorSwatch name="Info" color={colors.info} />
      </Section>

      <Section title="Buttons">
        <View style={styles.buttonRow}>
          <ThemedButton title="Primary" variant="primary" onPress={() => {}} />
        </View>

        <View style={styles.buttonRow}>
          <ThemedButton
            title="Secondary"
            variant="secondary"
            onPress={() => {}}
          />
        </View>

        <View style={styles.buttonRow}>
          <ThemedButton title="Outline" variant="outline" onPress={() => {}} />
        </View>

        <View style={styles.buttonRow}>
          <ThemedButton title="Ghost" variant="ghost" onPress={() => {}} />
        </View>

        <View style={styles.buttonRow}>
          <ThemedButton
            title="Loading"
            variant="primary"
            loading={true}
            onPress={() => {}}
          />
        </View>

        <View style={styles.buttonRow}>
          <ThemedButton
            title="Disabled"
            variant="primary"
            disabled={true}
            onPress={() => {}}
          />
        </View>

        <View style={styles.buttonRow}>
          <ThemedButton
            title="Small"
            variant="primary"
            size="small"
            onPress={() => {}}
          />
        </View>

        <View style={styles.buttonRow}>
          <ThemedButton
            title="Large"
            variant="primary"
            size="large"
            onPress={() => {}}
          />
        </View>

        <View style={styles.buttonRow}>
          <ThemedButton
            title="Toggle Theme"
            variant="primary"
            fullWidth
            onPress={toggleTheme}
            leftIcon={
              <Ionicons
                name={theme === "dark" ? "sunny" : "moon"}
                size={20}
                color="white"
              />
            }
          />
        </View>
      </Section>

      <Section title="Inputs">
        <ThemedInput label="Regular Input" placeholder="Type something..." />

        <ThemedInput
          label="Password Input"
          placeholder="Enter password"
          secureTextEntry
        />

        <ThemedInput
          label="With Left Icon"
          placeholder="Search..."
          leftIcon={
            <Ionicons name="search" size={24} color={colors.textSecondary} />
          }
        />

        <ThemedInput
          label="With Right Icon"
          placeholder="Clear input"
          rightIcon={
            <Ionicons
              name="close-circle"
              size={24}
              color={colors.textSecondary}
            />
          }
          onPressRightIcon={() => {}}
        />

        <ThemedInput
          label="With Error"
          placeholder="Email address"
          error="Please enter a valid email address"
        />
      </Section>
    </ScrollView>
  );
}

// Helper components for the showcase
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.section, { borderColor: colors.border }]}>
      <ThemedText
        variant="headingMedium"
        color="primary"
        style={{ marginBottom: spacing.md }}
      >
        {title}
      </ThemedText>
      {children}
    </View>
  );
}

function ColorSwatch({ name, color }: { name: string; color: string }) {
  const { colors, spacing, borderRadius } = useTheme();

  return (
    <View style={styles.colorRow}>
      <View
        style={[
          styles.colorSwatch,
          {
            backgroundColor: color,
            borderColor: colors.border,
            borderRadius: borderRadius.md,
          },
        ]}
      />
      <ThemedText variant="bodyMedium">{name}</ThemedText>
      <ThemedText variant="bodySmall" color="textSecondary">
        {color}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginVertical: 16,
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    marginRight: 12,
    borderWidth: 1,
  },
  buttonRow: {
    marginBottom: 12,
  },
});
