"use client";
import { persistor, store } from "./store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { LinguiProvider } from "@/components/providers/LinguiProvider";

export function Providers({ children }: { children: any }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <LinguiProvider>
          {children}
        </LinguiProvider>
      </PersistGate>
    </Provider>
  );
}
