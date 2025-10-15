import { openDB } from "idb";
//import CONFIG from "../config";

const DB_NAME = "cutwaterzDB";
const STORE_NAME = "pendingActions";



// open DB
async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    },
  });
}
export async function saveOfflineAction(action) {
  try {
    const db = await getDB();
    await db.add(STORE_NAME, { ...action, createdAt: Date.now() });
    console.log("Saved offline action", action);
  } catch (err) {
    console.error("saveOfflineAction error:", err);
  }
}

export async function getPendingActions() {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}


export async function removeAction(id) {
  const db = await getDB();
  return db.delete(STORE_NAME, id);
}

export async function syncActions() {
  const actions = await getPendingActions();
  if (!actions || actions.length === 0) return;

  console.log("Attempting to sync", actions.length, "actions...");
  for (const action of actions) {
    try {
      const res = await fetch(action.url, {
        method: action.method,
        headers: { "Content-Type": "application/json" },
        body: action.body ? JSON.stringify(action.body) : undefined,
      });

      if (!res.ok) {
        console.warn("Sync failed for action (server returned non-OK):", action, res.status);
        continue; 
      }

      await removeAction(action.id);
      console.log("Synced action:", action);
    } catch (err) {
      console.error("Network/sync error for action:", action, err);
    }
  }
}
