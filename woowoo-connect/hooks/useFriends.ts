import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface Friend {
  id: string;
  name: string;
  relationshipId: string;
  // Add other friend properties as needed
}

export function useFriends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { personId } = useAuth();

  useEffect(() => {
    async function fetchFriends() {
      if (!personId) return;

      try {
        setIsLoading(true);
        console.log("Fetching friends for personId:", personId);

        // First, get relationships where user is personId
        const { data: asPersonRelationships, error: asPersonError } =
          await supabase
            .from("relationship")
            .select(
              `
            id,
            type,
            related_person:related_person_id (id, name)
          `
            )
            .eq("person_id", personId);

        if (asPersonError) throw asPersonError;

        // Then, get relationships where user is relatedPersonId
        const { data: asRelatedRelationships, error: asRelatedError } =
          await supabase
            .from("relationship")
            .select(
              `
            id,
            type,
            related_person:person_id (id, name)
          `
            )
            .eq("related_person_id", personId);

        if (asRelatedError) throw asRelatedError;

        console.log("Relationships as person:", asPersonRelationships || 0);
        console.log(
          "Relationships as related person:",
          asRelatedRelationships || 0
        );

        // Combine and format the results
        const friendsList: Friend[] = [];

        // Add friends where user is personId
        if (asPersonRelationships) {
          asPersonRelationships.forEach((rel: any) => {
            if (rel.related_person) {
              friendsList.push({
                id: rel.related_person.id,
                name: rel.related_person.name,
                relationshipId: rel.id,
              });
            }
          });
        }

        // Add friends where user is relatedPersonId
        if (asRelatedRelationships) {
          asRelatedRelationships.forEach((rel: any) => {
            if (rel.related_person) {
              friendsList.push({
                id: rel.related_person.id,
                name: rel.related_person.name,
                relationshipId: rel.id,
              });
            }
          });
        }

        console.log("Total friends found:", friendsList.length);
        setFriends(friendsList);
      } catch (err) {
        console.error("Error fetching friends:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchFriends();
  }, [personId]);

  return { friends, isLoading, error };
}
