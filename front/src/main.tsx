import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { ClerkProvider } from "@clerk/clerk-react";
import { Toaster } from "sonner";
import "./index.css";

// Получаем Publishable Key из переменных окружения
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <ThemeProvider>
        <App />
        <Toaster position="top-right" richColors />
      </ThemeProvider>
    </ClerkProvider>
  </React.StrictMode>
);
