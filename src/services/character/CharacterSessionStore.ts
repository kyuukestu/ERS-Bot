import { CharacterCreationWizard } from "~/wizards/CharacterCreationWizard";
import { CharacterEditField } from "~/types/character";
import { type CharacterSession } from "~/types/character";

export class CharacterSessionStore {
  private sessions = new Map<string, CharacterSession>();

  create(userId: string) {
    const session: CharacterSession = {
      wizard: new CharacterCreationWizard(userId),
      editing: CharacterEditField.None,
    };

    this.sessions.set(userId, session);

    return session;
  }

  get(userId: string) {
    return this.sessions.get(userId);
  }

  delete(userId: string) {
    this.sessions.delete(userId);
  }

  has(userId: string) {
    return this.sessions.has(userId);
  }

  clearEditing(session: CharacterSession) {
    session.editing = CharacterEditField.None;
  }
}

export const characterSessionStore = new CharacterSessionStore();
