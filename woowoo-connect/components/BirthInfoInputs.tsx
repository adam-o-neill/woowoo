import React, { useState, useEffect, useRef } from "react";
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
} from "react-native";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { ThemedButton } from "./ThemedButton";

interface BirthInfoInputsProps {
  onSubmit: (birthInfo: {
    dateOfBirth: string;
    timeOfBirth: string;
    placeOfBirth: string;
  }) => Promise<void>;
  loading: boolean;
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

// Full screen component approach
export function BirthInfoForm({ onSubmit, loading }: BirthInfoInputsProps) {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const { colors, spacing, borderRadius } = useTheme();

  // Main form state
  const [month, setMonth] = useState(new Date().getMonth());
  const [day, setDay] = useState(new Date().getDate());
  const [year, setYear] = useState(new Date().getFullYear());
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [ampm, setAmPm] = useState("AM");
  const [placeOfBirth, setPlaceOfBirth] = useState("");

  // UI state for selector menus
  const [activeSelector, setActiveSelector] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState(false);

  // Add this constant for the input accessory view ID
  const inputAccessoryViewID = "birthInfoDone";

  // Calculate max days for selected month/year
  const getMaxDays = () => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Adjust day if it exceeds max days for month
  useEffect(() => {
    const maxDays = getMaxDays();
    if (day > maxDays) {
      setDay(maxDays);
    }
  }, [month, year]);

  // Add this effect to handle keyboard appearance
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        // Delay the scroll slightly to ensure the keyboard is fully shown
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleSubmit = async () => {
    try {
      const date = new Date(year, month, day);
      const formattedDate = format(date, "yyyy-MM-dd");

      // Convert 12-hour to 24-hour format
      let hours24 = hour;
      if (ampm === "PM" && hour < 12) hours24 += 12;
      if (ampm === "AM" && hour === 12) hours24 = 0;

      const formattedTime = `${String(hours24).padStart(2, "0")}:${String(
        minute
      ).padStart(2, "0")}`;

      await onSubmit({
        dateOfBirth: formattedDate,
        timeOfBirth: formattedTime,
        placeOfBirth,
      });
    } catch (error) {
      console.error("Error saving birth info:", error);
    }
  };

  const renderSelector = () => {
    if (!activeSelector) return null;

    let data: string[] = [];
    let currentValue: number = 0;
    let setFunction: (value: number) => void = () => {};

    switch (activeSelector) {
      case "month":
        data = MONTHS;
        currentValue = month;
        setFunction = setMonth;
        break;
      case "day":
        data = DAYS.slice(0, getMaxDays());
        currentValue = day - 1; // Adjust for 0-indexed array
        setFunction = (index) => setDay(index + 1); // Adjust back to 1-indexed days
        break;
      case "year":
        data = YEARS;
        currentValue = YEARS.findIndex((y) => parseInt(y) === year);
        setFunction = (index) => setYear(parseInt(YEARS[index]));
        break;
      case "hour":
        data = HOURS;
        currentValue = HOURS.findIndex((h) => parseInt(h) === hour);
        setFunction = (index) => setHour(parseInt(HOURS[index]));
        break;
      case "minute":
        data = MINUTES;
        currentValue = minute;
        setFunction = setMinute;
        break;
      case "ampm":
        data = AMPM;
        currentValue = AMPM.indexOf(ampm);
        setFunction = (index) => setAmPm(AMPM[index]);
        break;
    }

    return (
      <View style={styles.selectorOverlay}>
        <TouchableOpacity
          style={[
            styles.selectorBackground,
            { backgroundColor: colors.overlay },
          ]}
          activeOpacity={1}
          onPress={() => setActiveSelector(null)}
        />
        <ThemedView
          variant="card"
          style={[
            styles.selectorContainer,
            {
              borderTopLeftRadius: borderRadius.lg,
              borderTopRightRadius: borderRadius.lg,
            },
          ]}
        >
          <View
            style={[
              styles.selectorHeader,
              { borderBottomColor: colors.border },
            ]}
          >
            <ThemedText variant="headingSmall" style={styles.selectorTitle}>
              Select {activeSelector}
            </ThemedText>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setActiveSelector(null)}
            >
              <ThemedText variant="labelLarge" color="primary">
                Done
              </ThemedText>
            </TouchableOpacity>
          </View>

          <FlatList
            data={data}
            keyExtractor={(item, index) => index.toString()}
            style={styles.selectorList}
            initialScrollIndex={currentValue > 5 ? currentValue - 3 : 0}
            getItemLayout={(_, index) => ({
              length: 50,
              offset: 50 * index,
              index,
            })}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.selectorItem,
                  index === currentValue && [
                    styles.selectorItemSelected,
                    { backgroundColor: colors.backgroundSecondary },
                  ],
                ]}
                onPress={() => {
                  setFunction(index);
                  setActiveSelector(null);
                }}
              >
                <ThemedText
                  variant="bodyLarge"
                  color={index === currentValue ? "primary" : "text"}
                  style={index === currentValue && { fontWeight: "bold" }}
                >
                  {item}
                </ThemedText>
              </TouchableOpacity>
            )}
          />
        </ThemedView>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, { backgroundColor: colors.background }]}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ThemedText variant="labelLarge" color="primary">
              Back
            </ThemedText>
          </TouchableOpacity>
          <ThemedText variant="headingMedium">Birth Details</ThemedText>
          <View style={styles.backButton} />
        </View>

        <View style={styles.promptContainer}>
          <ThemedView
            variant="card"
            style={[styles.promptBox, { borderColor: colors.border }]}
          >
            <ThemedText variant="bodySmall" align="center">
              Enter your birth details to create your personalized experience
            </ThemedText>
          </ThemedView>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollContainer}
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sectionContainer}>
            <ThemedText
              variant="headingSmall"
              style={{ marginBottom: spacing.xs }}
            >
              Date of Birth
            </ThemedText>
            <ThemedText
              variant="bodySmall"
              color="textSecondary"
              style={{ marginBottom: spacing.md }}
            >
              Please select your birth date
            </ThemedText>

            <View style={styles.dateContainer}>
              <TouchableOpacity
                style={[
                  styles.dateField,
                  {
                    borderColor: colors.border,
                    borderRadius: borderRadius.md,
                    marginHorizontal: spacing.xs,
                  },
                ]}
                onPress={() => setActiveSelector("month")}
              >
                <ThemedText variant="bodyMedium">{MONTHS[month]}</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.dateField,
                  {
                    borderColor: colors.border,
                    borderRadius: borderRadius.md,
                    marginHorizontal: spacing.xs,
                  },
                ]}
                onPress={() => setActiveSelector("day")}
              >
                <ThemedText variant="bodyMedium">{day}</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.dateField,
                  {
                    borderColor: colors.border,
                    borderRadius: borderRadius.md,
                    marginHorizontal: spacing.xs,
                  },
                ]}
                onPress={() => setActiveSelector("year")}
              >
                <ThemedText variant="bodyMedium">{year}</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <ThemedText
              variant="headingSmall"
              style={{ marginBottom: spacing.xs }}
            >
              Time of Birth
            </ThemedText>
            <ThemedText
              variant="bodySmall"
              color="textSecondary"
              style={{ marginBottom: spacing.md }}
            >
              Select your birth time (if known)
            </ThemedText>

            <View style={styles.timeContainer}>
              <TouchableOpacity
                style={[
                  styles.timeField,
                  {
                    borderColor: colors.border,
                    borderRadius: borderRadius.md,
                  },
                ]}
                onPress={() => setActiveSelector("hour")}
              >
                <ThemedText variant="bodyMedium">{hour}</ThemedText>
              </TouchableOpacity>

              <ThemedText variant="displaySmall" style={styles.timeSeparator}>
                :
              </ThemedText>

              <TouchableOpacity
                style={[
                  styles.timeField,
                  {
                    borderColor: colors.border,
                    borderRadius: borderRadius.md,
                  },
                ]}
                onPress={() => setActiveSelector("minute")}
              >
                <ThemedText variant="bodyMedium">
                  {String(minute).padStart(2, "0")}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.ampmField,
                  {
                    borderColor: colors.border,
                    borderRadius: borderRadius.md,
                    marginLeft: spacing.md,
                  },
                ]}
                onPress={() => setActiveSelector("ampm")}
              >
                <ThemedText variant="bodyMedium">{ampm}</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <ThemedText
              variant="headingSmall"
              style={{ marginBottom: spacing.xs }}
            >
              Place of Birth
            </ThemedText>
            <ThemedText
              variant="bodySmall"
              color="textSecondary"
              style={{ marginBottom: spacing.md }}
            >
              Please enter your birth location
            </ThemedText>

            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                {
                  borderColor: focusedInput
                    ? colors.inputFocusBorder
                    : colors.inputBorder,
                  backgroundColor: colors.inputBackground,
                  color: colors.inputText,
                  borderRadius: borderRadius.md,
                },
              ]}
              placeholder="City, State/Province, Country"
              placeholderTextColor={colors.inputPlaceholder}
              value={placeOfBirth}
              onChangeText={setPlaceOfBirth}
              onFocus={() => {
                setFocusedInput(true);
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }}
              onBlur={() => setFocusedInput(false)}
              inputAccessoryViewID={
                Platform.OS === "ios" ? inputAccessoryViewID : undefined
              }
            />
          </View>

          {/* Add the InputAccessoryView for iOS */}
          {Platform.OS === "ios" && (
            <InputAccessoryView nativeID={inputAccessoryViewID}>
              <View
                style={[
                  styles.inputAccessory,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    borderTopColor: colors.border,
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => {
                    Keyboard.dismiss();
                    setFocusedInput(false);
                  }}
                  style={styles.doneButton}
                >
                  <ThemedText variant="labelLarge" color="primary">
                    Done
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </InputAccessoryView>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>

        <View
          style={[
            styles.fixedButtonContainer,
            {
              backgroundColor: colors.background,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
              elevation: 5,
            },
          ]}
        >
          <ThemedButton
            title="Save Birth Details"
            variant="primary"
            onPress={handleSubmit}
            loading={loading}
            disabled={!placeOfBirth.trim()}
          />
        </View>

        {renderSelector()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Prompt component that will link to the form
export function BirthInfoInputs({ onSubmit, loading }: BirthInfoInputsProps) {
  const router = useRouter();

  const navigateToBirthForm = () => {
    // Simply navigate to the birth-info-form route
    router.push("/birth-info-form");
  };

  return (
    <View style={styles.promptContainer}>
      <ThemedButton
        onPress={navigateToBirthForm}
        title="Add your birth details for personal insights"
        variant="primary"
      />
    </View>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 80,
  },
  promptContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  promptBox: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  sectionContainer: {
    marginBottom: 30,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateField: {
    flex: 1,
    height: 55,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  timeField: {
    width: 70,
    height: 55,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  timeSeparator: {
    marginHorizontal: 8,
  },
  ampmField: {
    width: 70,
    height: 55,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    height: 55,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  bottomPadding: {
    height: 100,
  },
  fixedButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  selectorOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  selectorBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  selectorContainer: {
    height: 350,
  },
  selectorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  selectorTitle: {
    textTransform: "capitalize",
  },
  closeButton: {
    padding: 8,
  },
  selectorList: {
    flex: 1,
    paddingVertical: 8,
  },
  selectorItem: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  selectorItemSelected: {},
  inputAccessory: {
    width: "100%",
    height: 44,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    borderTopWidth: 1,
  },
  doneButton: {
    marginRight: 16,
    padding: 8,
  },
});
