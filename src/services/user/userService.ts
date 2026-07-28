import { supabase } from "~/database/supabase/supabase";

class UserService {
  async getOrCreateUser(discordId: string, username: string) {
    const { data: existing, error } = await supabase
      .from("users")
      .select("id")
      .eq("discord_id", discordId)
      .maybeSingle();

    if (error) throw error;

    if (existing) {
      return existing.id;
    }
  
    const { data: created, error: createError } = await supabase
      .from("users")
      .insert({
        discord_id: discordId,
        username,
      })
      .select("id")
      .single();
  
    if (createError) throw createError;
  
    return created.id;
  }

  async linkUser(userId: string, characterId: string) {
    const { error } = await supabase.from("user_characters")
      .insert({
        user_id: userId,
        character_id: characterId,
      });

    if (error) throw error;
  }
}

export const userService = new UserService();
