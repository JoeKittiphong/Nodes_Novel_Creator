// IndexedDB wrapper for NovelCreator save/load
const DB_NAME = 'NovelCreatorDB';
const DB_VERSION = 1;
const STORE_NAME = 'projects';
const PROJECT_KEY = 'current';

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
}

export async function saveProject(data) {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.put(data, PROJECT_KEY);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
            tx.oncomplete = () => db.close();
        });
    } catch (e) {
        console.warn('IndexedDB save failed:', e);
    }
}

export async function loadProject() {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(PROJECT_KEY);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
            tx.oncomplete = () => db.close();
        });
    } catch (e) {
        console.warn('IndexedDB load failed:', e);
        return null;
    }
}

export async function deleteProject() {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.delete(PROJECT_KEY);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
            tx.oncomplete = () => db.close();
        });
    } catch (e) {
        console.warn('IndexedDB delete failed:', e);
    }
}
