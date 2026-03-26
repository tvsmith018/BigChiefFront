"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { makeStore, makePersistor } from "@/_store/store"; // see below
import { PreloadedState } from "../preloader";
import { useRef } from "react";
import { markHydrated } from "../reducers/app/appSlice";

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

  return (
    <Provider store={storeRef.current}>
      <PersistGate 
        loading={null}  
        persistor={persistorRef.current!}
        onBeforeLift={()=>{
          storeRef.current?.dispatch(markHydrated())
        }}
      >
        {children}
      </PersistGate>
    </Provider>
  );
}