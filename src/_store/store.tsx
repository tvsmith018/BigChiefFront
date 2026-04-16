import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import type { PersistedState } from "redux-persist/es/types";
import storage from "./storage/storage";
import userReducer from "./reducers/user/userSlice";
import appReducer from "./reducers/app/appSlice";
import type { PreloadedState } from "./preloader";

const rootReducer = combineReducers({
  user: userReducer,
  app: appReducer,
});

const persistConfig = {
  key: "root",
  version: 2,
  storage,
  // Keep client/UI-only persisted state. Auth/user should come from server cookies on each request.
  blacklist: ["user"],
  migrate: (state: PersistedState | undefined): Promise<PersistedState | undefined> => {
    if (!state || typeof state !== "object") {
      return Promise.resolve(state);
    }

    const next = { ...(state as Record<string, unknown>) };
    delete next.user;
    return Promise.resolve(next as PersistedState);
  },
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
type PersistedReducerState = ReturnType<typeof persistedReducer>;

export function makeStore(preloadedState?: PreloadedState) {
  return configureStore({
    reducer: persistedReducer,
    preloadedState: {
      ...rootReducer(undefined, { type: "@@INIT" }),
      ...preloadedState,
    } as PersistedReducerState,
    middleware: (getDefault) =>
      getDefault({
        serializableCheck: { ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"] },
      }),
  });
}

export function makePersistor(store: ReturnType<typeof makeStore>) {
  return persistStore(store);
}

export type RootState = ReturnType<ReturnType<typeof makeStore>["getState"]>;
export type AppDispatch = ReturnType<typeof makeStore>["dispatch"];