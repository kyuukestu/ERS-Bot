import { characterFieldRegistry } from "~/services/character/edit/CharacterFieldRegistry";
import { characterLinksEditService } from "~/services/character/edit/CharacterLinksEditService";

export function registerLinkFields() {
  characterFieldRegistry.register(
    "character-edit-sheet-url-modal",
    {
      field: "external_sheet_url",
      inputId: "external_sheet_url",

      onComplete: async (interaction) => {
        await characterLinksEditService.show(interaction);
      },
    },
  );
}
