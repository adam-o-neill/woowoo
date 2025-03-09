import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BirthInfoForm } from "@/components/BirthInfoInputs";
import { useBirthChart } from "@/hooks/useBirthChart";

export default function BirthInfoFormScreen() {
  const router = useRouter();
  // Get the birth chart hook to access the updateBirthInfo function
  const { updateBirthInfo, loading } = useBirthChart();

  const handleSubmit = async (birthInfo: {
    dateOfBirth: string;
    timeOfBirth: string;
    placeOfBirth: string;
  }) => {
    try {
      // Call the actual updateBirthInfo function from the hook
      await updateBirthInfo(birthInfo);
      // Navigate back after successful submission
      router.back();
    } catch (error) {
      console.error("Error updating birth info:", error);
    }
  };

  return <BirthInfoForm onSubmit={handleSubmit} loading={loading} />;
}
