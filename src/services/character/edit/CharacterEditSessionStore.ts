import type { CharacterEditSession } from "~/types/character";

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

class CharacterEditSessionStore {
  private sessions = new Map<string, CharacterEditSession>();

  private isExpired(session: CharacterEditSession) {
    return Date.now() - session.createdAt > SESSION_TIMEOUT;
  }

  create(userId: string, character: CharacterEditSession["character"]) {
    this.delete(userId);

    const timeout = setTimeout(() => {
      this.delete(userId);
    }, SESSION_TIMEOUT);

    const sessions: CharacterEditSession = {
      character,
      createdAt: Date.now(),
      timeout,
      dirtyFields: new Set(),
    };

    this.sessions.set(userId, sessions);

    return sessions;
  }

  get(userId: string) {
    const session = this.sessions.get(userId);

    if (!session) {
      return null;
    }

    if (this.isExpired(session)) {
      this.delete(userId);
      return null;
    }

    return session;
  }

  has(userId: string) {
    return this.sessions.has(userId);
  }

  delete(userId: string) {
    const session = this.sessions.get(userId);

    if (!session) return;

    clearTimeout(session.timeout);

    this.sessions.delete(userId);
  }
}

export const characterEditSessionStore = new CharacterEditSessionStore();
