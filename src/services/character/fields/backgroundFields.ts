import { characterFieldRegistry } from "~/services/character/edit/CharacterFieldRegistry";
import { characterBackgroundEditService } from "../edit/CharacterBackgroundEditService";

export function registerBackgroundFields() {
  console.log("BACKGROUND FIELDS MODULE LOADED.");
  

  characterFieldRegistry.register("character-edit-origin-region-modal", {
    field: "origin_region_id",
    inputId: "origin_region_id",

    onComplete: async (interaction) => {
      await characterBackgroundEditService.show(interaction);
    },
  });

  characterFieldRegistry.register("character-edit-associated-region-modal", {
    field: "associated_region_id",
    inputId: "associated_region_id",

    onComplete: async (interaction) => {
      await characterBackgroundEditService.show(interaction);
    },
  });

  characterFieldRegistry.register("character-edit-age-modal", {
    field: "age",
    inputId: "age",

    onComplete: async (interaction) => {
      await characterBackgroundEditService.show(interaction);
    },
  });

  characterFieldRegistry.register("character-edit-dob-modal", {
    field: "dob",
    inputId: "dob",

    onComplete: async (interaction) => {
      await characterBackgroundEditService.show(interaction);
    },
  });

  characterFieldRegistry.register("character-edit-gender-modal", {
    field: "gender",
    inputId: "gender",

    onComplete: async (interaction) => {
      await characterBackgroundEditService.show(interaction);
    },
  });
}
