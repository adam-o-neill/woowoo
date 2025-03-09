import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

const AuthContext = createContext<
  | {
      session: Session | null;
      isLoading: boolean;
      signIn: (phone: string) => Promise<void>;
      signOut: () => Promise<void>;
      signUp: (phone: string) => Promise<void>;
      verifyOtp: (code: string) => Promise<void>;
    }
  | undefined
>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        setSession(session!);
        setIsLoading(false);
      } else if (event === "SIGNED_OUT") {
        setSession(null);
        setIsLoading(false);
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
    const { error } = await supabase.auth.verifyOtp({
      phone: phoneNumber, // You need to store the phone number somewhere accessible
      token: code,
      type: "sms", // or 'phone' depending on your setup
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{ session, isLoading, signIn, signUp, signOut, verifyOtp }}
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
