import {
  createEmptyProgress,
  type ProgressSnapshot,
} from "../core/progress/types";

export interface ProgressRepository {
  load(): Promise<ProgressSnapshot>;
  save(progress: ProgressSnapshot): Promise<void>;
}

const DATABASE_NAME = "trace-learning";
const STORE_NAME = "progress";
const SNAPSHOT_KEY = "current";
const FALLBACK_KEY = "trace-progress-v1";

function isProgressSnapshot(value: unknown): value is ProgressSnapshot {
  if (!value || typeof value !== "object") return false;
  return (value as Partial<ProgressSnapshot>).version === 1;
}

export class IndexedDbProgressRepository implements ProgressRepository {
  constructor(private readonly indexedDb: IDBFactory = indexedDB) {}

  private open() {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = this.indexedDb.open(DATABASE_NAME, 1);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async load(): Promise<ProgressSnapshot> {
    const database = await this.open();
    try {
      const value = await new Promise<unknown>((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, "readonly");
        const request = transaction.objectStore(STORE_NAME).get(SNAPSHOT_KEY);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      return isProgressSnapshot(value) ? value : createEmptyProgress();
    } finally {
      database.close();
    }
  }

  async save(progress: ProgressSnapshot): Promise<void> {
    const database = await this.open();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, "readwrite");
        transaction.objectStore(STORE_NAME).put(progress, SNAPSHOT_KEY);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
    } finally {
      database.close();
    }
  }
}

class ResilientProgressRepository implements ProgressRepository {
  constructor(
    private readonly primary: ProgressRepository,
    private readonly fallbackStorage: Storage | undefined,
  ) {}

  async load(): Promise<ProgressSnapshot> {
    try {
      return await this.primary.load();
    } catch {
      const raw = this.fallbackStorage?.getItem(FALLBACK_KEY);
      if (!raw) return createEmptyProgress();
      try {
        const parsed: unknown = JSON.parse(raw);
        return isProgressSnapshot(parsed) ? parsed : createEmptyProgress();
      } catch {
        return createEmptyProgress();
      }
    }
  }

  async save(progress: ProgressSnapshot): Promise<void> {
    try {
      await this.primary.save(progress);
    } catch {
      this.fallbackStorage?.setItem(FALLBACK_KEY, JSON.stringify(progress));
    }
  }
}

export function createBrowserProgressRepository(): ProgressRepository {
  const fallback = typeof localStorage === "undefined" ? undefined : localStorage;
  if (typeof indexedDB === "undefined") {
    return new ResilientProgressRepository(
      {
        load: async () => createEmptyProgress(),
        save: async () => undefined,
      },
      fallback,
    );
  }
  return new ResilientProgressRepository(
    new IndexedDbProgressRepository(indexedDB),
    fallback,
  );
}
