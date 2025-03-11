import React from "react";
import { Stack } from "expo-router";
import { FriendForm } from "@/components/FriendForm";
import { useRouter } from "expo-router";

export default function AddFriendScreen() {
  const router = useRouter();

  const handleSuccess = () => {
    // Navigate back to friends list after successful submission
    router.push("/friends");
  };

  return (
    <>
      <Stack.Screen options={{ title: "Add a Friend" }} />
      <FriendForm onSuccess={handleSuccess} />
    </>
  );
}
