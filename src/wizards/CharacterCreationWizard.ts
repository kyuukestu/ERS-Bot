import { GENDERS } from "~/constants/genders";
import { REGIONS } from "~/constants/regions";
import { isOneOf, validateLength } from "~/utils/validation";
import { type CharacterDraft } from "~/types/character";

export enum CharacterWizardStep {
  Name,
  Origin,
  Association,
  Gender,
  Review,
  Confirmed,
}

export type ValidationResult = { success: boolean; message: string };

export class CharacterCreationWizard {
  private step = CharacterWizardStep.Name;

  private draft: CharacterDraft = {
    fullName: null,
    originRegion: null,
    associatedRegion: null,
    gender: null,
  };

  constructor(public readonly userId: string) {}

  get currentStep() {
    return this.step;
  }

  get data(): Readonly<CharacterDraft> {
    return this.draft;
  }

  setReview(): void {
    this.step = CharacterWizardStep.Review;
  }

  setConfirmed(): void {
    this.step = CharacterWizardStep.Confirmed;
  }

  setName(name: string): ValidationResult {
    const cleaned = name.trim();

    if (!validateLength(cleaned, 2, 80)) {
      return {
        success: false,
        message: "Character name must be between 2 and 80 characters.",
      };
    }

    this.draft.fullName = cleaned;
    this.step = CharacterWizardStep.Origin;

    return { success: true, message: "Success!" };
  }

  setOrigin(region: string): ValidationResult {
    if (!isOneOf(region, REGIONS)) {
      return {
        success: false,
        message: "Invalid region.",
      };
    }

    this.draft.originRegion = region;
    this.step = CharacterWizardStep.Association;

    return { success: true, message: "Success!" };
  }

  setAssociatedRegion(region: string): ValidationResult {
    if (!isOneOf(region, REGIONS)) {
      return {
        success: false,
        message: "Invalid region.",
      };
    }

    this.draft.associatedRegion = region;
    this.step = CharacterWizardStep.Gender;

    return { success: true, message: "Success!" };
  }

  setGender(gender: string): ValidationResult {
    if (!isOneOf(gender, GENDERS)) {
      return {
        success: false,
        message: "Invalid Geder.",
      };
    }

    this.draft.gender = gender;

    return { success: true,  message: "Success!" };
  }

  getReview(): string {
    return [
      `Name: ${this.draft.fullName}`,
      `Origin Region: ${this.draft.originRegion}`,
      `Associated Region: ${this.draft.associatedRegion}`,
      `Gender: ${this.draft.gender}`,
    ].join('\n');
  }
  
  isComplete(): boolean {
    return (
      this.draft.fullName !== null &&
      this.draft.originRegion !== null &&
      this.draft.associatedRegion !== null &&
      this.draft.gender !== null
    );
  }
  
  confirm(): ValidationResult {
    if (!this.isComplete()) {
      return {
        success: false,
        message: "Character information is incomplete.",
      };
    }
  
    if (this.step !== CharacterWizardStep.Review) {
      return {
        success: false,
        message: "Character is not ready for confirmation.",
      };
    }
  
    this.step = CharacterWizardStep.Confirmed;
  
    return {
      success: true,  message: "Success!"
    };
  }
}
