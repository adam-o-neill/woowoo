import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  Dimensions,
  SafeAreaView,
  Modal,
} from "react-native";
import { format } from "date-fns";
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

// Helper function to create a date without timezone issues
const createLocalDate = (year: number, month: number, day: number) => {
  // Create a date string in ISO format but without the timezone part
  const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}T00:00:00`;
  return new Date(dateString);
};

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
  const [date, setDate] = useState<Date>(() => {
    if (initialValues.dateOfBirth) {
      // Parse the date string without timezone conversion
      const [year, month, day] = initialValues.dateOfBirth
        .split("-")
        .map(Number);
      return createLocalDate(year, month - 1, day);
    }
    return createLocalDate(1990, 0, 1); // Default to Jan 1, 1990
  });

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
      handleSubmit();
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
        // For Android, create a new date to avoid timezone issues
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const day = selectedDate.getDate();
        setDate(createLocalDate(year, month, day));
      }
    } else {
      // For iOS, we update the temp value and wait for confirm
      if (selectedDate) {
        // For iOS, create a new date to avoid timezone issues
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const day = selectedDate.getDate();
        setTempDate(createLocalDate(year, month, day));
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

    // Format the date in YYYY-MM-DD format without timezone conversion
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    // Format the time in HH:MM format
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
          loading={loading}
          disabled={loading}
          style={{ marginTop: 16 }}
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
