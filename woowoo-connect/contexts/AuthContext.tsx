import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

// Extend the context to include person data
const AuthContext = createContext<
  | {
      session: Session | null;
      isLoading: boolean;
      personId: string | null;
      hasCompletedProfile: boolean;
      signIn: (phone: string) => Promise<void>;
      signOut: () => Promise<void>;
      signUp: (phone: string) => Promise<void>;
      verifyOtp: (code: string) => Promise<{
        personId: string | null;
        hasCompletedProfile: boolean;
      }>;
      setPersonId: (id: string) => void;
      setHasCompletedProfile: (completed: boolean) => void;
    }
  | undefined
>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [personId, setPersonId] = useState<string | null>(null);
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);

  // Check for existing session and person data
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);

      if (event === "SIGNED_IN") {
        setSession(session!);

        // Check if this user has a person record
        if (session?.user?.phone) {
          try {
            await ensurePersonExists(session.user.phone);
          } catch (error) {
            console.error("Error ensuring person record exists:", error);
          }
        }

        setIsLoading(false);
      } else if (event === "SIGNED_OUT") {
        setSession(null);
        setPersonId(null);
        setHasCompletedProfile(false);
        setIsLoading(false);
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);

      if (session?.user?.phone) {
        try {
          await ensurePersonExists(session.user.phone);
        } catch (error) {
          console.error("Error ensuring person record exists:", error);
        }
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Helper function to ensure a person record exists for a phone number
  const ensurePersonExists = async (phone: string): Promise<string | null> => {
    try {
      // First check if a person record already exists for this phone
      const { data: existingPerson, error: queryError } = await supabase
        .from("person")
        .select("id, name")
        .eq("phone", phone)
        .limit(1);

      if (queryError) throw queryError;

      if (existingPerson && existingPerson.length > 0) {
        console.log("Found existing person record:", existingPerson[0].id);
        setPersonId(existingPerson[0].id);
        console.log("Has completed profile:", existingPerson[0].name != null);
        setHasCompletedProfile(existingPerson[0].name != null);
        return existingPerson[0].id;
      }

      // If no person exists, create one
      const { data: newPerson, error: insertError } = await supabase
        .from("person")
        .insert([
          {
            phone: phone,
            user_id: session?.user?.id,
            created_by_id: session?.user?.id,
          },
        ])
        .select("id")
        .single();

      if (insertError) throw insertError;

      console.log("Created new person record:", newPerson.id);
      setPersonId(newPerson.id);
      setHasCompletedProfile(false);
      return newPerson.id;
    } catch (error) {
      console.error("Error in ensurePersonExists:", error);
      return null;
    }
  };

  const signIn = async (phone: string) => {
    setPhoneNumber(phone);
    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });
    if (error) throw error;
  };

  const signUp = async (phone: string) => {
    setPhoneNumber(phone);
    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const verifyOtp = async (code: string) => {
    if (!phoneNumber) throw new Error("Phone number not found");

    const { error, data } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: code,
      type: "sms",
    });

    if (error) throw error;

    // After successful verification, ensure a person record exists
    // and return the profile status
    if (data?.user?.phone) {
      try {
        const personId = await ensurePersonExists(data.user.phone);
        // Return whether the user has completed their profile
        return {
          personId,
          hasCompletedProfile: personId
            ? await checkProfileCompletion(personId)
            : false,
        };
      } catch (error) {
        console.error(
          "Error ensuring person record exists after verification:",
          error
        );
        return { personId: null, hasCompletedProfile: false };
      }
    }

    return { personId: null, hasCompletedProfile: false };
  };

  // Add a helper function to check if a profile is complete
  const checkProfileCompletion = async (personId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("person")
        .select("name, birth_info_id")
        .eq("id", personId)
        .single();

      if (error) throw error;

      return data.name != null && data.birth_info_id != null;
    } catch (error) {
      console.error("Error checking profile completion:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        personId,
        hasCompletedProfile,
        signIn,
        signUp,
        signOut,
        verifyOtp,
        setPersonId,
        setHasCompletedProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
