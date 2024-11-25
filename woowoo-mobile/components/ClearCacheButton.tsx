import React from "react";
import { Button, View, StyleSheet } from "react-native";
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
      <Button title="Refresh" onPress={clearCache} color="#fff" />
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
});

export default ClearCacheButton;
