import { characterFieldRegistry } from "~/services/character/edit/CharacterFieldRegistry";
import { characterIdentityEditService } from "~/services/character/edit/CharacterIdentityEditService";

export function registerIdentityFields() {
  console.log("IDENTITY FIELDS MODULE LOADED.");
  
  characterFieldRegistry.register("character-edit-full-name-modal", {
    field: "full_name",
    inputId: "full_name",
    
    onComplete: async (interaction) => {
      console.log("Registering identity fields!!!!!!!!!!!!!!!!!!!!!!!!!");
      await characterIdentityEditService.show(interaction);
    },
  });
}
