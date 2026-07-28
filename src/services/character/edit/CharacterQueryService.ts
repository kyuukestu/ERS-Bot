import { supabase } from "~/database/supabase/supabase";
import type { CharacterSummaryDTO } from "~/types/character";


function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

class CharacterQueryService {
  async getUserCharacters(discordId: string): Promise<CharacterSummaryDTO[]> {
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        user_characters (
          characters (
            id,
            slug,
            full_name,
            image_src
          )
        )
      `,
      )
      .eq("discord_id", discordId)
      .single();

    if (error) throw error;

    return data.user_characters.map(({ characters }) => ({
      id: characters.id,
      full_name: characters.full_name,
      slug: characters.slug ?? "404",
      image_src: characters.image_src,
    }));
  }

  async getCharacterForEdit(characterId: string) {
    const { data, error } = await supabase
      .from("characters")
      .select(
        "id, slug, full_name, short_names, nicknames, origin_region_id, associated_region_id, category, age, dob, gender, height, summary, color, image_src, image_type, external_sheet_url",
      )
      .eq("id", characterId)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      slug: data.slug,
      full_name: data.full_name,
      short_names: normalizeStringArray(data.short_names),
      nicknames: normalizeStringArray(data.nicknames),
      origin_region_id: data.origin_region_id,
      associated_region_id: data.associated_region_id,
      category: data.category,
      age: data.age,
      dob: data.dob,
      gender: data.gender,
      height: data.height,
      summary: data.summary,
      color: data.color,
      image_src: data.image_src,
      image_type: data.image_type,
      external_sheet_url: data.external_sheet_url,
    };
  }
}

export const characterQueryService = new CharacterQueryService();
