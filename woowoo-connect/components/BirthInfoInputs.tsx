import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Dimensions,
  SafeAreaView,
  Keyboard,
  InputAccessoryView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { ThemedButton } from "./ThemedButton";
import DateTimePicker from "@react-native-community/datetimepicker";

interface BirthInfoData {
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
}

interface BirthInfoFormProps {
  initialValues?: Partial<BirthInfoData>;
  onSubmit: (data: BirthInfoData) => void;
  loading?: boolean;
  showSubmitButton?: boolean;
  submitButtonText?: string;
}

// Static data for date/time selection
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const YEARS = Array.from({ length: 100 }, (_, i) =>
  String(new Date().getFullYear() - i)
);
const HOURS = Array.from({ length: 12 }, (_, i) => String(i === 0 ? 12 : i));
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0")
);
const AMPM = ["AM", "PM"];

// Simple embedded form component
export function BirthInfoForm({
  initialValues = {},
  onSubmit,
  loading = false,
  showSubmitButton = true,
  submitButtonText = "Save Birth Info",
}: BirthInfoFormProps) {
  const { colors, spacing } = useTheme();

  // Form state
  const [date, setDate] = useState<Date>(
    initialValues.dateOfBirth
      ? new Date(initialValues.dateOfBirth)
      : new Date(1990, 0, 1)
  );
  const [time, setTime] = useState<Date>(() => {
    const defaultTime = new Date();
    defaultTime.setHours(12, 0, 0, 0);

    if (initialValues.timeOfBirth) {
      const [hours, minutes] = initialValues.timeOfBirth.split(":").map(Number);
      defaultTime.setHours(hours, minutes, 0, 0);
    }
    return defaultTime;
  });
  const [placeOfBirth, setPlaceOfBirth] = useState(
    initialValues.placeOfBirth || ""
  );

  // UI state - only one picker can be open at a time
  const [pickerMode, setPickerMode] = useState<"date" | "time" | null>(null);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const [tempTime, setTempTime] = useState<Date | null>(null);

  // Auto-submit when all fields are filled (for FriendForm)
  useEffect(() => {
    if (!showSubmitButton && placeOfBirth.trim() && date && time) {
      const formattedDate = format(date, "yyyy-MM-dd");
      const formattedTime = format(time, "HH:mm");

      onSubmit({
        dateOfBirth: formattedDate,
        timeOfBirth: formattedTime,
        placeOfBirth: placeOfBirth.trim(),
      });
    }
  }, [placeOfBirth, date, time, showSubmitButton]);

  const openDatePicker = () => {
    setTempDate(date);
    setPickerMode("date");
  };

  const openTimePicker = () => {
    setTempTime(time);
    setPickerMode("time");
  };

  const handleCancel = () => {
    setPickerMode(null);
    setTempDate(null);
    setTempTime(null);
  };

  const handleConfirm = () => {
    if (pickerMode === "date" && tempDate) {
      setDate(tempDate);
    } else if (pickerMode === "time" && tempTime) {
      setTime(tempTime);
    }
    setPickerMode(null);
    setTempDate(null);
    setTempTime(null);
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    if (Platform.OS === "android") {
      setPickerMode(null);
      if (selectedDate) {
        setDate(selectedDate);
      }
    } else {
      // For iOS, we update the temp value and wait for confirm
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleTimeChange = (event: any, selectedTime: Date | undefined) => {
    if (Platform.OS === "android") {
      setPickerMode(null);
      if (selectedTime) {
        setTime(selectedTime);
      }
    } else {
      // For iOS, we update the temp value and wait for confirm
      if (selectedTime) {
        setTempTime(selectedTime);
      }
    }
  };

  const handleSubmit = () => {
    if (!placeOfBirth.trim()) {
      alert("Please enter your place of birth");
      return;
    }

    const formattedDate = format(date, "yyyy-MM-dd");
    const formattedTime = format(time, "HH:mm");

    onSubmit({
      dateOfBirth: formattedDate,
      timeOfBirth: formattedTime,
      placeOfBirth: placeOfBirth.trim(),
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputGroup}>
        <ThemedText variant="labelLarge">Date of Birth</ThemedText>
        <TouchableOpacity
          style={[
            styles.input,
            {
              borderColor: colors.inputBorder,
              backgroundColor: colors.inputBackground,
            },
          ]}
          onPress={openDatePicker}
        >
          <ThemedText style={{ color: colors.inputText }}>
            {format(date, "MMMM d, yyyy")}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText variant="labelLarge">Time of Birth</ThemedText>
        <TouchableOpacity
          style={[
            styles.input,
            {
              borderColor: colors.inputBorder,
              backgroundColor: colors.inputBackground,
            },
          ]}
          onPress={openTimePicker}
        >
          <ThemedText style={{ color: colors.inputText }}>
            {format(time, "h:mm a")}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText variant="labelLarge">Place of Birth</ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: colors.inputBorder,
              backgroundColor: colors.inputBackground,
              color: colors.inputText,
            },
          ]}
          value={placeOfBirth}
          onChangeText={setPlaceOfBirth}
          placeholder="e.g., New York, NY, USA"
          placeholderTextColor={colors.inputPlaceholder}
        />
      </View>

      {showSubmitButton && (
        <ThemedButton
          title={submitButtonText}
          onPress={handleSubmit}
          disabled={!placeOfBirth.trim() || loading}
          loading={loading}
          style={{ marginTop: spacing.md }}
        />
      )}

      {/* Modal for iOS pickers */}
      {Platform.OS === "ios" && pickerMode && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <SafeAreaView style={styles.modalContent}>
              <ThemedView style={styles.pickerContainer}>
                <View style={styles.pickerHeader}>
                  <TouchableOpacity onPress={handleCancel}>
                    <ThemedText variant="labelMedium" color="primary">
                      Cancel
                    </ThemedText>
                  </TouchableOpacity>
                  <ThemedText variant="labelLarge">
                    {pickerMode === "date" ? "Select Date" : "Select Time"}
                  </ThemedText>
                  <TouchableOpacity onPress={handleConfirm}>
                    <ThemedText variant="labelMedium" color="primary">
                      Done
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                {pickerMode === "date" && (
                  <DateTimePicker
                    value={tempDate || date}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    style={styles.picker}
                  />
                )}

                {pickerMode === "time" && (
                  <DateTimePicker
                    value={tempTime || time}
                    mode="time"
                    display="spinner"
                    onChange={handleTimeChange}
                    style={styles.picker}
                  />
                )}
              </ThemedView>
            </SafeAreaView>
          </View>
        </Modal>
      )}

      {/* Android pickers - these appear as dialogs automatically */}
      {Platform.OS === "android" && pickerMode === "date" && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {Platform.OS === "android" && pickerMode === "time" && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}

// For backward compatibility - this is the standalone version
export function BirthInfoInputs({
  onSubmit,
  loading = false,
}: {
  onSubmit: (data: BirthInfoData) => void;
  loading: boolean;
}) {
  return (
    <View style={styles.standaloneContainer}>
      <ThemedText variant="headingMedium" style={styles.title}>
        Enter Your Birth Details
      </ThemedText>
      <ThemedText variant="bodyMedium" style={styles.subtitle}>
        This information helps us create your personalized experience
      </ThemedText>

      <BirthInfoForm
        onSubmit={onSubmit}
        loading={loading}
        showSubmitButton={true}
      />
    </View>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  standaloneContainer: {
    width: "100%",
    padding: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    marginBottom: 24,
    textAlign: "center",
    opacity: 0.7,
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    width: "100%",
    backgroundColor: "transparent",
  },
  pickerContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  picker: {
    height: 200,
    width: "100%",
    marginHorizontal: "auto",
  },
});
