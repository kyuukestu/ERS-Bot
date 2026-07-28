import {
  type ButtonInteraction,
  type ModalSubmitInteraction,
  type StringSelectMenuInteraction,
  MessageFlags,
} from "discord.js";

import type { CharacterEditSession } from "~/types/character";
import { createListEditorButtons } from "~/components/buttons/listEditorButtons";
import { createListItemSelector } from "~/components/StringSelectMenus/listItemSelector";
import { createListEditorModal } from "~/components/modals/listEditorModal";

type ListEditorConfig = {
  title: string;
  values: string[];
  onSave: (values: string[]) => void;

  onBack: (
    interaction:
      ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction,
  ) => Promise<void>;
};

export const LIST_EDITOR_INPUT_ID = "list-editor-value";

class ListEditorService {
  private createContent(session: CharacterEditSession) {
    const editor = session.listEditor;

    if (!editor) return "";

    const values =
      editor.values.length > 0
        ? editor.values
            .map((value, index) => `${index + 1}. ${value}`)
            .join("\n")
        : "No entries.";

    return `**Editing ${editor.title}**\n\n` + values;
  }

  async start(
    interaction: ButtonInteraction | StringSelectMenuInteraction,
    session: CharacterEditSession,
    config: ListEditorConfig,
  ) {
    session.listEditor = {
      title: config.title,
      values: [...config.values],
      onSave: config.onSave,
      onBack: config.onBack,
    };

    await this.show(interaction, session);
  }

  async show(
    interaction: ButtonInteraction | StringSelectMenuInteraction,
    session: CharacterEditSession,
  ) {
    await interaction.update({
      content: this.createContent(session),
      components: [createListEditorButtons()],
    });
  }

  async showAfterModal(
    interaction: ModalSubmitInteraction,
    session: CharacterEditSession,
  ) {
    await interaction.reply({
      content: this.createContent(session),
      components: [createListEditorButtons()],
      flags: MessageFlags.Ephemeral,
    });
  }

  async handleButton(
    interaction: ButtonInteraction,
    session: CharacterEditSession,
  ) {
    switch (interaction.customId) {
      case "list-editor-add":
        await this.add(interaction, session);
        break;

      case "list-editor-edit":
        await this.selectItem(interaction, session, "edit");
        break;

      case "list-editor-delete":
        await this.selectItem(interaction, session, "delete");
        break;

      case "list-editor-back":
        await this.finish(interaction, session);
        break;
    }
  }

  async add(interaction: ButtonInteraction, session: CharacterEditSession) {
    const editor = session.listEditor;

    if (!editor) return;

    editor.selectedIndex = undefined;

    await interaction.showModal(createListEditorModal(`Add ${editor.title}`));
  }

  async selectItem(
    interaction: ButtonInteraction,
    session: CharacterEditSession,
    action: "edit" | "delete",
  ) {
    const editor = session.listEditor;

    if (!editor || editor.values.length === 0) {
      return;
    }

    await interaction.update({
      content: `Select an item to ${action}.`,
      components: [createListItemSelector(editor.values, action)],
    });
  }

  async handleSelection(
    interaction: StringSelectMenuInteraction,
    session: CharacterEditSession,
  ) {
    const editor = session.listEditor;

    if (!editor) return;

    const index = Number(interaction.values[0]);

    if (interaction.customId === "list-editor-delete-item") {
      editor.values.splice(index, 1);
      editor.onSave(editor.values);
      await this.show(interaction, session);

      return;
    }

    if (interaction.customId === "list-editor-edit-item") {
      editor.selectedIndex = index;

      await interaction.showModal(
        createListEditorModal(`Edit ${editor.title}`, editor.values[index]),
      );
    }
  }

  async handleModal(
    interaction: ModalSubmitInteraction,
    session: CharacterEditSession,
  ) {
    const editor = session.listEditor;

    if (!editor) return;

    const value = interaction.fields
      .getTextInputValue(LIST_EDITOR_INPUT_ID)
      .trim();

    if (!value) {
      await interaction.reply({
        content: "Value cannot be empty.",
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    if (editor.selectedIndex === undefined) {
      editor.values.push(value);
    } else {
      editor.values[editor.selectedIndex] = value;
    }

    editor.selectedIndex = undefined;
    editor.onSave(editor.values);

    await this.showAfterModal(interaction, session);
  }

  private save(session: CharacterEditSession) {
    const editor = session.listEditor;

    if (!editor) return;

    editor.onSave(editor.values);

    session.listEditor = undefined;
  }

  private async finish(
    interaction: ButtonInteraction,
    session: CharacterEditSession,
  ) {
    const editor = session.listEditor;

    if (!editor) return;

    this.save(session);

    await editor.onBack(interaction);
  }
}

export const listEditorService = new ListEditorService();
