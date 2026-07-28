import { characterFieldRegistry } from "~/services/character/edit/CharacterFieldRegistry";
import { characterAppearanceEditService } from "~/services/character/edit/CharacterAppearanceEditService";

export function registerAppearanceFields() {
  console.log("APPEARANCE FIELDS MODULE LOADED.");
  

  characterFieldRegistry.register("character-edit-height-modal", {
    field: "height",
    inputId: "height",

    onComplete: async (interaction) => {
      await characterAppearanceEditService.show(interaction);
    },
  });

  characterFieldRegistry.register("character-edit-color-modal", {
    field: "color",
    inputId: "color",

    onComplete: async (interaction) => {
      await characterAppearanceEditService.show(interaction);
    },
  });

  characterFieldRegistry.register("character-edit-image-modal", {
    field: "image_src",
    inputId: "image",

    onComplete: async (interaction) => {
      await characterAppearanceEditService.show(interaction);
    },
  });
}
