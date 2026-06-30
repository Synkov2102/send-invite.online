import { isInviteState, type InviteState } from "@invite/shared";
import type { InvitePalette } from "@/lib/invite-theme";

export const editorDraftStorageKey = "invite.editor.draft.v1";
const editorDraftStoragePrefix = "invite.editor.draft.v2";
const editorMediaDatabaseName = "invite.editor.media.v1";
const editorMediaStoreName = "media";
const editorMusicStorageKey = "current-music";

export type EditorDraft = {
  customPalette: InvitePalette;
  hasLocalMusic: boolean;
  invite: InviteState;
  version: 2;
};

function isLocalMusicSource(value: string) {
  return value.startsWith("data:audio/");
}

function openEditorMediaDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const request = window.indexedDB.open(editorMediaDatabaseName, 1);

    request.addEventListener("error", () => resolve(null));
    request.addEventListener("upgradeneeded", () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(editorMediaStoreName)) {
        database.createObjectStore(editorMediaStoreName);
      }
    });
    request.addEventListener("success", () => resolve(request.result));
  });
}

async function saveLocalMusic(musicUrl: string) {
  const database = await openEditorMediaDatabase();

  if (!database) {
    return;
  }

  try {
    await new Promise<void>((resolve) => {
      const transaction = database.transaction(editorMediaStoreName, "readwrite");
      transaction.addEventListener("abort", () => resolve());
      transaction.addEventListener("complete", () => resolve());
      transaction.addEventListener("error", () => resolve());
      transaction.objectStore(editorMediaStoreName).put(musicUrl, editorMusicStorageKey);
    });
  } finally {
    database.close();
  }
}

export { isLocalMusicSource, saveLocalMusic };

export async function readLocalMusic() {
  const database = await openEditorMediaDatabase();

  if (!database) {
    return null;
  }

  try {
    return await new Promise<string | null>((resolve) => {
      const transaction = database.transaction(editorMediaStoreName, "readonly");
      const request = transaction.objectStore(editorMediaStoreName).get(editorMusicStorageKey);

      request.addEventListener("error", () => resolve(null));
      request.addEventListener("success", () => {
        resolve(typeof request.result === "string" ? request.result : null);
      });
    });
  } finally {
    database.close();
  }
}

async function removeLocalMusic() {
  const database = await openEditorMediaDatabase();

  if (!database) {
    return;
  }

  try {
    await new Promise<void>((resolve) => {
      const transaction = database.transaction(editorMediaStoreName, "readwrite");
      transaction.addEventListener("abort", () => resolve());
      transaction.addEventListener("complete", () => resolve());
      transaction.addEventListener("error", () => resolve());
      transaction.objectStore(editorMediaStoreName).delete(editorMusicStorageKey);
    });
  } finally {
    database.close();
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isInvitePalette(value: unknown): value is InvitePalette {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.accent === "string" &&
    typeof value.background === "string" &&
    typeof value.id === "string" &&
    typeof value.ink === "string" &&
    typeof value.label === "string" &&
    typeof value.line === "string" &&
    typeof value.mood === "string" &&
    typeof value.muted === "string" &&
    typeof value.photoText === "string" &&
    typeof value.surface === "string" &&
    typeof value.veil === "string"
  );
}

function getEditorDraftStorageKey(templateId?: string) {
  return templateId ? `${editorDraftStoragePrefix}.${templateId}` : editorDraftStorageKey;
}

export function readEditorDraft(templateId?: string): EditorDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storageKey = getEditorDraftStorageKey(templateId);
    const storedDraft = window.localStorage.getItem(storageKey);

    if (!storedDraft) {
      return null;
    }

    const draft = JSON.parse(storedDraft) as unknown;

    if (
      isRecord(draft) &&
      (draft.version === 1 || draft.version === 2) &&
      isInviteState(draft.invite) &&
      isInvitePalette(draft.customPalette)
    ) {
      return {
        customPalette: draft.customPalette,
        hasLocalMusic:
          (draft.version === 2 && draft.hasLocalMusic === true) ||
          isLocalMusicSource(draft.invite.musicUrl),
        invite: draft.invite,
        version: 2,
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function saveEditorDraft(draft: EditorDraft, templateId?: string) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const musicUrl = draft.invite.musicUrl;
    const shouldStoreLocalMusic = draft.hasLocalMusic && isLocalMusicSource(musicUrl);

    if (shouldStoreLocalMusic) {
      void saveLocalMusic(musicUrl);
    } else if (!draft.hasLocalMusic) {
      void removeLocalMusic();
    }

    window.localStorage.setItem(
      getEditorDraftStorageKey(templateId),
      JSON.stringify({
        ...draft,
        invite: shouldStoreLocalMusic ? { ...draft.invite, musicUrl: "" } : draft.invite,
      }),
    );
    return true;
  } catch {
    return false;
  }
}
