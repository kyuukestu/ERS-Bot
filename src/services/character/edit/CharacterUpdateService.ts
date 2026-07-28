import { supabase } from "~/database/supabase/supabase";
import type { EditableCharacterDTO } from "~/types/character";
import type { Database } from "~/types/database";


type CharacterUpdate =
  Database["public"]["Tables"]["characters"]["Update"];

class CharacterUpdateService {
  async updateCharacter(
    character: EditableCharacterDTO,
    dirtyFields: Set<keyof EditableCharacterDTO>,
  ) {
    const updatePayload: CharacterUpdate = {};

    for (const field of dirtyFields) {
      updatePayload[field] = character[field] as never;
    }

    const { error } = await supabase
      .from("characters")
      .update(updatePayload)
      .eq("id", character.id);

    if (error) {
      throw error;
    }
  }
}

export const characterUpdateService =
  new CharacterUpdateService();
