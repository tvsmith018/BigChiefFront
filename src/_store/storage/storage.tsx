import createWebStorage from "redux-persist/lib/storage/createWebStorage";

const createNoopStorage = () => ({
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
});

const storage =
  typeof globalThis.window === "undefined"
    ? createNoopStorage()
    : createWebStorage("local");

export default storage;