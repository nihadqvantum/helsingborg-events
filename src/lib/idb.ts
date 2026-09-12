import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'hbg-events';
const STORE = 'meta';
let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      },
    });
  }
  return dbPromise;
}

export async function getLastSeenIds(): Promise<string[]> {
  const db = await getDb();
  return (await db.get(STORE, 'lastSeenIds')) || [];
}

export async function setLastSeenIds(ids: string[]) {
  const db = await getDb();
  await db.put(STORE, ids, 'lastSeenIds');
}

export async function getNotifyEnabled(): Promise<boolean> {
  const db = await getDb();
  return Boolean(await db.get(STORE, 'notifyEnabled'));
}

export async function setNotifyEnabled(v: boolean) {
  const db = await getDb();
  await db.put(STORE, v, 'notifyEnabled');
}
