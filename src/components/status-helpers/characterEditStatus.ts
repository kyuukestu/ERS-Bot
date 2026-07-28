import { type EditableCharacterDTO } from "~/types/character";

export function truncate(value: string, maxLength = 100): string {
  if (!value) {
    return "None";
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}

export function formatIdentity(character: EditableCharacterDTO) {
  return truncate(
    [
      character.full_name,
      character.category,
      character.nicknames.length
        ? character.nicknames.join(", ")
        : "No nicknames",
    ].join(" | "),
  );
}

export function formatAppearance(character: EditableCharacterDTO) {
  return truncate(
    [
      character.height ?? "No height",
      character.color ?? "No color",
      character.image_src ? "Image set" : "No image",
    ].join(" | "),
  );
}

export function formatBackground(character: EditableCharacterDTO) {
  return truncate(
    [
      character.age ? `${character.age} years` : "Age unknown",
      character.dob ?? "No DOB",
      character.associated_region_id ? "Region set" : "No region",
    ].join(" | "),
  );
}

export function formatLinks(character: EditableCharacterDTO) {
  return character.external_sheet_url
    ? "External sheet linked"
    : "No external sheet";
}
