import React from "react";
import { View, Text, StyleSheet } from "react-native";

export function Section({
  title,
  container,
  children,
}: {
  title?: string;
  container?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.section, container && { gap: 16 }]}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#333",
    color: "#fff",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "SpaceMono",
    marginBottom: 12,
    fontWeight: "bold",
  },
});
