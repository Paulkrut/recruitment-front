"use client";
import { persistor, store } from "./store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { LinguiProvider } from "@/components/providers/LinguiProvider";
import type { Messages } from "@lingui/core";
import { useState, useEffect } from "react";

type ProvidersProps = {
  children: React.ReactNode;
  initialLocale: string;
  initialMessages: Messages;
};

export function Providers({ children, initialLocale, initialMessages }: ProvidersProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Provider store={store}>
      {isClient ? (
        <PersistGate loading={null} persistor={persistor}>
          <LinguiProvider initialLocale={initialLocale} initialMessages={initialMessages}>
            {children}
          </LinguiProvider>
        </PersistGate>
      ) : (
        <LinguiProvider initialLocale={initialLocale} initialMessages={initialMessages}>
          {children}
        </LinguiProvider>
      )}
    </Provider>
  );
}
