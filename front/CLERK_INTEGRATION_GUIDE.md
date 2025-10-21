# Clerk Integration Guide for React + Vite

## ✅ Completed Setup

Your application is already configured with the **correct and current** Clerk integration following official guidelines.

## 📋 What Has Been Done

### 1. ✅ Clerk SDK Installed
```bash
npm install @clerk/clerk-react@latest
```

### 2. ✅ Environment Variable Configured
- File: `/front/.env.local`
- Variable name: `VITE_CLERK_PUBLISHABLE_KEY`
- Note: The `VITE_` prefix is **required** for Vite to expose environment variables to client-side code

### 3. ✅ ClerkProvider in main.tsx
The `<ClerkProvider>` is correctly placed in `main.tsx` (not in App.tsx), wrapping the entire application:

```typescript
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ClerkProvider>
  </React.StrictMode>
);
```

### 4. ✅ Clerk Components Used
Your app uses official Clerk components:
- `<SignedIn>` - Shows content only to authenticated users
- `<SignedOut>` - Shows content only to unauthenticated users
- `<UserButton>` - Pre-built user menu with profile and sign out
- `<SignInButton>` - Button to trigger sign-in
- `<SignUpButton>` - Button to trigger sign-up
- `<SignIn>` - Full sign-in component
- `<SignUp>` - Full sign-up component

## 🔑 Next Steps for You

### Step 1: Get Your Clerk Publishable Key

1. Go to [Clerk Dashboard → API Keys](https://dashboard.clerk.com/last-active?path=api-keys)
2. Choose **"React"** from framework options
3. Copy your **Publishable Key** (starts with `pk_test_...` or `pk_live_...`)

### Step 2: Add the Key to .env.local

Open `/front/.env.local` and replace the placeholder:

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
```

⚠️ **Important**: Never commit `.env.local` to Git. It's already excluded via `.gitignore`.

### Step 3: Restart the Development Server

```bash
cd front
npm run dev
```

## 🧪 Testing Your Integration

1. Visit http://localhost:5173
2. Click "Войти" (Sign In) or "Начать" (Sign Up)
3. Complete authentication
4. You should see:
   - UserButton in the navbar
   - Access to protected routes (/dashboard, /generator, etc.)
   - User data available via `useAuth()` hook

## 📚 Official Documentation

- [Clerk React Quickstart](https://clerk.com/docs/quickstarts/react)
- [Clerk React SDK Reference](https://clerk.com/docs/references/react/overview)

## ✅ Verification Checklist

- [x] Environment variable named `VITE_CLERK_PUBLISHABLE_KEY`
- [x] `<ClerkProvider>` is in `main.tsx` (not `App.tsx`)
- [x] `publishableKey` prop used (not deprecated `frontendApi`)
- [x] `.env.local` excluded from Git via `.gitignore`
- [x] Official Clerk components used throughout the app
- [ ] **YOU**: Add your actual Clerk Publishable Key to `.env.local`
- [ ] **YOU**: Test sign-in/sign-up flow

## 🛡️ Security Notes

- ✅ Publishable keys are safe to expose in client-side code
- ✅ `.env.local` is git-ignored by default
- ✅ Never use secret keys (sk_*) in frontend code
- ✅ Always use environment variables, never hardcode keys

---

**Your integration is complete and follows current best practices!** 🎉

Just add your Clerk Publishable Key and you're ready to go.
