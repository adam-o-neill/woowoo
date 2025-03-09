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
  StatusBar,
} from "react-native";
import { format } from "date-fns";
import { Section } from "./Section";
import { useRouter } from "expo-router";

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
          style={styles.selectorBackground}
          activeOpacity={1}
          onPress={() => setActiveSelector(null)}
        />
        <View style={styles.selectorContainer}>
          <View style={styles.selectorHeader}>
            <Text style={styles.selectorTitle}>Select {activeSelector}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setActiveSelector(null)}
            >
              <Text style={styles.closeButtonText}>Done</Text>
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
                  index === currentValue && styles.selectorItemSelected,
                ]}
                onPress={() => {
                  setFunction(index);
                  setActiveSelector(null);
                }}
              >
                <Text
                  style={[
                    styles.selectorItemText,
                    index === currentValue && styles.selectorItemTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 20}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Birth Details</Text>
          <TouchableOpacity
            style={[
              styles.submitButtonSmall,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Date of Birth</Text>
              <Text style={styles.sectionSubtitle}>When were you born?</Text>
              <View style={styles.dateContainer}>
                <TouchableOpacity
                  style={styles.dateField}
                  onPress={() => {
                    if (focusedInput) {
                      inputRef.current?.blur();
                      setFocusedInput(false);
                    }
                    setActiveSelector("month");
                  }}
                >
                  <Text style={styles.dateFieldText}>{MONTHS[month]}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dateField}
                  onPress={() => {
                    if (focusedInput) {
                      inputRef.current?.blur();
                      setFocusedInput(false);
                    }
                    setActiveSelector("day");
                  }}
                >
                  <Text style={styles.dateFieldText}>{day}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dateField}
                  onPress={() => {
                    if (focusedInput) {
                      inputRef.current?.blur();
                      setFocusedInput(false);
                    }
                    setActiveSelector("year");
                  }}
                >
                  <Text style={styles.dateFieldText}>{year}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Time of Birth</Text>
              <Text style={styles.sectionSubtitle}>
                What time were you born?
              </Text>
              <View style={styles.timeContainer}>
                <TouchableOpacity
                  style={styles.timeField}
                  onPress={() => {
                    if (focusedInput) {
                      inputRef.current?.blur();
                      setFocusedInput(false);
                    }
                    setActiveSelector("hour");
                  }}
                >
                  <Text style={styles.timeFieldText}>{hour}</Text>
                </TouchableOpacity>

                <Text style={styles.timeSeparator}>:</Text>

                <TouchableOpacity
                  style={styles.timeField}
                  onPress={() => {
                    if (focusedInput) {
                      inputRef.current?.blur();
                      setFocusedInput(false);
                    }
                    setActiveSelector("minute");
                  }}
                >
                  <Text style={styles.timeFieldText}>
                    {String(minute).padStart(2, "0")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.ampmField}
                  onPress={() => {
                    if (focusedInput) {
                      inputRef.current?.blur();
                      setFocusedInput(false);
                    }
                    setActiveSelector("ampm");
                  }}
                >
                  <Text style={styles.ampmFieldText}>{ampm}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Place of Birth</Text>
              <Text style={styles.sectionSubtitle}>Where were you born?</Text>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="City, State/Province, Country"
                placeholderTextColor="#666"
                value={placeOfBirth}
                onChangeText={setPlaceOfBirth}
                onFocus={() => {
                  setFocusedInput(true);
                  setActiveSelector(null);
                  // Scroll to make input visible when keyboard appears
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 100);
                }}
                onBlur={() => setFocusedInput(false)}
              />
            </View>

            {/* Extra padding at bottom for keyboard */}
            <View style={styles.bottomPadding} />
          </View>
        </ScrollView>

        {/* Fixed submit button for when user scrolls down */}
        {!activeSelector && !focusedInput && (
          <View style={styles.fixedButtonContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? "Saving..." : "Save Birth Information"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

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
      <TouchableOpacity
        style={styles.promptButton}
        onPress={navigateToBirthForm}
      >
        <Text style={styles.promptText}>
          ✨ Add your birth details for personal insights
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  promptContainer: {
    paddingVertical: 16,
  },
  promptButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    backgroundColor: "#111",
  },
  promptText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "SpaceMono",
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    backgroundColor: "#111",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "SpaceMono",
    fontWeight: "bold",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: "#4a7dff",
    fontFamily: "SpaceMono",
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  formContainer: {
    padding: 20,
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    color: "#fff",
    fontFamily: "SpaceMono",
    fontWeight: "bold",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#999",
    fontFamily: "SpaceMono",
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateField: {
    flex: 1,
    height: 55,
    borderColor: "#333",
    borderWidth: 1,
    marginHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 8,
  },
  dateFieldText: {
    color: "#fff",
    fontFamily: "SpaceMono",
    fontSize: 16,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  timeField: {
    width: 70,
    height: 55,
    borderColor: "#333",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 8,
  },
  timeFieldText: {
    color: "#fff",
    fontFamily: "SpaceMono",
    fontSize: 16,
  },
  timeSeparator: {
    color: "#fff",
    fontFamily: "SpaceMono",
    fontSize: 24,
    marginHorizontal: 8,
  },
  ampmField: {
    width: 70,
    height: 55,
    borderColor: "#333",
    borderWidth: 1,
    marginLeft: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 8,
  },
  ampmFieldText: {
    color: "#fff",
    fontFamily: "SpaceMono",
    fontSize: 16,
  },
  input: {
    height: 55,
    borderColor: "#333",
    borderWidth: 1,
    paddingHorizontal: 16,
    color: "#fff",
    backgroundColor: "#111",
    borderRadius: 8,
    fontFamily: "SpaceMono",
    fontSize: 16,
  },
  bottomPadding: {
    height: 100, // Extra space at bottom for keyboard
  },
  fixedButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  submitButtonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: "#4a7dff",
  },
  submitButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#4a7dff",
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#2c4580",
  },
  submitButtonText: {
    color: "#fff",
    fontFamily: "SpaceMono",
    fontSize: 16,
    fontWeight: "bold",
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
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  selectorContainer: {
    backgroundColor: "#111",
    borderTopWidth: 1,
    borderTopColor: "#333",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: 350,
  },
  selectorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  selectorTitle: {
    color: "#fff",
    fontFamily: "SpaceMono",
    fontSize: 18,
    textTransform: "capitalize",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: "#4a7dff",
    fontFamily: "SpaceMono",
    fontSize: 16,
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
  selectorItemSelected: {
    backgroundColor: "#1a2446",
  },
  selectorItemText: {
    color: "#fff",
    fontFamily: "SpaceMono",
    fontSize: 18,
  },
  selectorItemTextSelected: {
    color: "#4a7dff",
    fontWeight: "bold",
  },
});
