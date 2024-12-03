import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ClearCacheButton = ({
  onCacheCleared,
}: {
  onCacheCleared: () => void;
}) => {
  const clearCache = async () => {
    try {
      await AsyncStorage.clear();
      console.log("Cache cleared!");
      if (onCacheCleared) onCacheCleared(); // Optional callback
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  };

  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity onPress={clearCache} style={styles.button}>
        <Text style={styles.buttonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: "#000",
    fontFamily: "monospace",
    marginHorizontal: "auto",
  },
  buttonText: {
    color: "#fff",
    fontFamily: "monospace",
    marginHorizontal: "auto",
  },
});

export default ClearCacheButton;
