"use client"
import {store, persistor} from "../store";
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from "react-redux";
import SessionProviders  from "./sessionProvider/sessionProvider";

export function Providers({children}: { children: React.ReactNode}) {
  return <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <SessionProviders>
        {children}
      </SessionProviders>
    </PersistGate>
  </Provider>;
}