import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from "redux-persist";
import storageEngine from './storage/storage';
import userReducer from './reducers/userReducer/userSlice'
import { combineReducers } from '@reduxjs/toolkit';

const persistConfig = {
  key: "root",
  storage: storageEngine,
};

const rootReducer = combineReducers({
  userReducer: userReducer
})

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store)