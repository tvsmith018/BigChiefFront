import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
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
  storage,
  whitelist: ["user"],
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
