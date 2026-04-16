"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import type { User } from "@/_types/auth/user";
import { makePersistor, makeStore } from "@/_store/store";
import { removeUser, storeUser } from "../reducers/user/userSlice";
import { markHydrated } from "../reducers/app/appSlice";
import { SessionSync } from "@/_services/auth/SessionSync";
import { PreloadedState } from "../preloader";

function sameUser(a?: User, b?: User) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return (
    a.id === b.id &&
    a.firstname === b.firstname &&
    a.lastname === b.lastname &&
    a.avatar === b.avatar
  );
}

export function ReduxProvider({
  children,
  preloadedState,
}: {
  children: React.ReactNode;
  preloadedState?: PreloadedState;
}) {
  const storeRef = useRef<ReturnType<typeof makeStore> | null>(null);
  const persistorRef = useRef<ReturnType<typeof makePersistor> | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore(preloadedState);
    persistorRef.current = makePersistor(storeRef.current);
  }

  const serverIsAuthenticated = preloadedState?.user?.isAuthenticated ?? false;
  const serverUser = preloadedState?.user?.data;

  useEffect(() => {
    const store = storeRef.current;
    if (!store) return;

    const state = store.getState();
    if (state.app.authTransitioning) {
      return;
    }

    const current = state.user;

    if (serverIsAuthenticated && serverUser) {
      if (!current.isAuthenticated || !sameUser(current.data, serverUser)) {
        store.dispatch(storeUser(serverUser));
      }
      return;
    }

    if (current.isAuthenticated) {
      store.dispatch(removeUser());
    }
  }, [serverIsAuthenticated, serverUser]);

  return (
    <Provider store={storeRef.current}>
      <PersistGate
        loading={null}
        persistor={persistorRef.current!}
        onBeforeLift={() => {
          storeRef.current?.dispatch(markHydrated());
        }}
      >
        <SessionSync />
        {children}
      </PersistGate>
    </Provider>
  );
}