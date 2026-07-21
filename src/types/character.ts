import { type Region } from "~/constants/regions";
import { type Gender } from "~/constants/genders";
import { type CharacterCreationWizard } from "~/wizards/CharacterCreationWizard";


export interface CharacterCreateInput {
	fullName: string;
	category: 'canon' | 'oc';

	originRegionId: string;
	currentRegionId: string;

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
