// src/utils/offlineSync.js
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

/**
 * Save an action to IndexedDB.
 * action = { url: string, method: 'POST'|'PATCH'|'PUT'|'DELETE', body: object }
 */
export async function saveOfflineAction(action) {
  try {
    const db = await getDB();
    await db.add(STORE_NAME, { ...action, createdAt: Date.now() });
    console.log("Saved offline action", action);
  } catch (err) {
    console.error("saveOfflineAction error:", err);
  }
}

/**
 * Read all pending actions
 */
export async function getPendingActions() {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

/**
 * Remove action by id
 */
export async function removeAction(id) {
  const db = await getDB();
  return db.delete(STORE_NAME, id);
}

/**
 * Try to sync all pending actions to server.
 * This is conservative: each action is tried once; if it succeeds we remove it.
 */
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
        continue; // keep it for next retry
      }

      // success -> remove from DB
      await removeAction(action.id);
      console.log("Synced action:", action);
    } catch (err) {
      console.error("Network/sync error for action:", action, err);
      // network error -> keep action for later
    }
  }
}
