import type { EditableCharacterDTO } from "~/types/character";
import type { ModalSubmitInteraction } from "discord.js";

export type CharacterFieldConfig = {
  field: keyof EditableCharacterDTO;

  inputId: string;

  parse?: (value: string) => unknown;

  onComplete?: (
    interaction: ModalSubmitInteraction,
  ) => Promise<void>;
};


class CharacterFieldRegistry {
  private fields = new Map<
    string,
    CharacterFieldConfig
  >();


  register(
    modalId: string,
    config: CharacterFieldConfig,
  ) {
    this.fields.set(
      modalId,
      config,
    );
  }


  get(modalId: string) {
    return this.fields.get(modalId);
  }
}


export const characterFieldRegistry =
  new CharacterFieldRegistry();
