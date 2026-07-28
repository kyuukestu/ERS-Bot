import { type Region } from "~/constants/regions";
import { type Gender } from "~/constants/genders";
import { type CharacterCreationWizard } from "~/wizards/CharacterCreationWizard";
import {
  type ModalSubmitInteraction,
  type StringSelectMenuInteraction,
  type ButtonInteraction,
} from "discord.js";

export interface CharacterCreateInput {
  fullName: string;
  category: "canon" | "oc";

  originRegionId: string;
  associatedRegionId: string;

  gender: string | null;
  age: number | null;

  imageSrc: string | null;
  color: string | null;

  summary: string | null;

  classes: {
    id: string;
    isPrimary: boolean;
  }[];
}

export type CharacterDraft = {
  fullName: string | null;
  originRegion: Region | null;
  associatedRegion: Region | null;
  gender: Gender | null;
};

export enum CharacterEditField {
  None,
  Name,
  Origin,
  AssociatedRegion,
  Gender,
}

export type CharacterSession = {
  wizard: CharacterCreationWizard;
  editing: CharacterEditField;
};

export type ListEditorMode = "idle" | "editing" | "adding" | "deleting";

export type ListEditorSession = {
  title: string;
  values: string[];
  onSave: (values: string[]) => void;

  onBack: (
    interaction:
      ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction,
  ) => Promise<void>;

  selectedIndex?: number;
};

export type CharacterEditSession = {
original: EditableCharacterDTO
  character: EditableCharacterDTO;
  timeout: NodeJS.Timeout;
  createdAt: number;
  dirtyFields: Set<keyof EditableCharacterDTO>;
  listEditor?: ListEditorSession;
};

export enum CharacterEditSection {
  Identity = "identity",
  Background = "background",
  Appearance = "appearance",
  Links = "links",
}

export type CharacterSummaryDTO = {
  id: string;
  full_name: string;
  slug: string;
  image_src: string | null;
};

export type EditableCharacterDTO = {
  id: string;
  slug: string | null;

  full_name: string;
  short_names: string[];
  nicknames: string[];

  origin_region_id: string | null;
  associated_region_id: string | null;

  category: string;

  age: number | null;
  dob: string | null;
  gender: string | null;
  height: string | null;

  summary: string | null;

  color: string | null;
  image_src: string | null;
  image_type: string | null;

  external_sheet_url: string | null;
};
