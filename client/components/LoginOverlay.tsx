import { useState, useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // NOTE: Button component is used differently here
import { cn } from "@/lib/utils";
import { supabase, SUPABASE_URL } from "@/lib/supabaseClient";
interface LoginOverlayProps {
  trigger?: React.ReactNode;
  // Optional controlled props (Index page used these)
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function LoginOverlay({ trigger, isOpen, onClose, onSuccess }: LoginOverlayProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  // Internal open state (used when not controlled via props)
  const [open, setOpen] = useState(false);

  // Listen for a custom window event to open the login overlay:
  //   window.dispatchEvent(new Event('open-login-overlay'))
  // Also support delegated clicks on elements with `data-login-trigger`.
  useEffect(() => {
    const onOpenEvent = () => setOpen(true);
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-login-trigger]')) {
        setOpen(true);
      }
    };

    window.addEventListener('open-login-overlay', onOpenEvent);
    document.addEventListener('click', onDocClick);
    return () => {
      window.removeEventListener('open-login-overlay', onOpenEvent);
      document.removeEventListener('click', onDocClick);
    };
  }, []);

  // --- STYLING MAPPING ---
  // Text Color: Dark Gray/Black
  // Button BG (Primary): Dark Blue/Black
  // Button BG (Social): White/Very Light Gray
  // -----------------------

  // If parent provided `isOpen`, treat component as controlled.
  const controlled = typeof isOpen !== "undefined";
  const dialogOpen = controlled ? isOpen! : open;

  const handleOpenChange = (next: boolean) => {
    if (!controlled) setOpen(next);
    if (!next && onClose) onClose();
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {/* If this component is controlled by parent (isOpen prop), don't render
          an automatic trigger — parent will manage opening. Otherwise render
          a trigger (custom or default). */}
      {!controlled && (trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button>Login</Button>
        </DialogTrigger>
      ))}
      <DialogPrimitive.Portal>
        {/* Full-screen Dark Overlay (Keeping existing Radix styles) */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            // Reduced max width to scale overlay for only social sign-in
            "max-w-[680px] w-full p-0 border-0 bg-transparent shadow-none overflow-hidden"
          )}
        >
          <DialogTitle className="sr-only">Login to NutriWise</DialogTitle>
          
          {/* Main Dialog Container (Matches the card color and shape) */}
          <div className="relative w-full rounded-2xl bg-white shadow-2xl flex flex-col lg:flex-row overflow-hidden">
            
            {/* Left side - Illustration Container (50% width) */}
            <div className="hidden lg:flex lg:w-1/2 p-4 justify-center items-center">
              {/* This container has the dark background from the reference image */}
              <div className="w-full h-full p-0 bg-[#0F0F0F] rounded-xl overflow-hidden flex justify-center items-center">
                 {/* Nutriwise Illustration - object-contain to prevent cropping */}
                 <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/fac3f74a8a249ac43ef32fda32b4e9db0f9c18a0?width=1286"
                    alt="Healthy eating illustration"
                    // Removed h-full to allow proportional scaling
                    className="w-full h-full object-contain p-8" // Added padding to separate image from border
                 />
              </div>
            </div>

            {/* Right side - Login Form Container (50% width) */}
            <div className="lg:w-1/2 flex flex-col gap-6 p-8">
              
              {/* Header - MODIFIED to only include NutriWise and Tagline */}
              <div className="flex flex-col gap-1">
                {/* NutriWise Title - Style: Black, bold, larger font */}
                <h1
                  className="text-left text-4xl tracking-tight text-black"
                  style={{
                    fontFamily: '"Gravitas One", Inter, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 700,
                  }}
                >
                  NutriWise.
                </h1>
                {/* Tagline - Style: Smaller, light gray text */}
                <p className="text-[#888888] text-sm font-normal">
                   Start eating healthier today! Sign Up for Nutriwise.
                </p>
              </div>

              {/* Social Sign In - simplified: only show social buttons */}
              <div className="flex flex-col gap-6 items-center w-full">
                

                <div className="flex flex-col gap-3 w-full max-w-[320px]">
                  {/* Google Button - Light style */}
                  <button
                    onClick={async () => {
                      setAuthError(null);
                      try {
                        setLoadingProvider('google');

                        // Construct the Supabase authorize URL for debugging so you can
                        // inspect the redirect_uri that will be sent to Google.
                        const debugUrl = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(window.location.origin)}`;
                        // Log to console so you can copy/paste into the browser and inspect
                        // Google query params (especially redirect_uri).
                        // eslint-disable-next-line no-console
                        console.info('Supabase Google authorize URL (debug):', debugUrl);

                        const { error } = await supabase.auth.signInWithOAuth({
                          provider: 'google',
                          options: { redirectTo: window.location.origin },
                        });

                        if (error) {
                          // Show friendly error in UI and console for debugging
                          // eslint-disable-next-line no-console
                          console.error('Supabase Google sign-in error', error);
                          setAuthError(error.message ?? String(error));
                        }
                      } finally {
                        setLoadingProvider(null);
                      }
                    }}
                    disabled={loadingProvider !== null}
                    className="flex items-center justify-center gap-3 py-2.5 px-3 rounded-lg border border-[#DDDDDD] bg-white hover:bg-[#F9F9F9] transition-colors shadow-sm"
                  >
                    <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">...</svg>
                    <span className="text-[#1A1A1A] font-sans text-sm font-medium">
                      {loadingProvider === 'google' ? 'Redirecting…' : 'Sign in with Google'}
                    </span>
                  </button>
                  {authError ? (
                    <p className="text-sm text-red-600 mt-2 text-center">{authError}</p>
                  ) : null}

                  {/* Facebook Button - Light style */}
                  <button
                    onClick={async () => {
                      setAuthError(null);
                      try {
                        setLoadingProvider('facebook');

                        const debugUrl = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/authorize?provider=facebook&redirect_to=${encodeURIComponent(window.location.origin)}`;
                        // eslint-disable-next-line no-console
                        console.info('Supabase Facebook authorize URL (debug):', debugUrl);

                        const { error } = await supabase.auth.signInWithOAuth({
                          provider: 'facebook',
                          options: { redirectTo: window.location.origin },
                        });

                        if (error) {
                          // eslint-disable-next-line no-console
                          console.error('Supabase Facebook sign-in error', error);
                          setAuthError(error.message ?? String(error));
                        }
                      } finally {
                        setLoadingProvider(null);
                      }
                    }}
                    disabled={loadingProvider !== null}
                    className="flex items-center justify-center gap-3 py-2.5 px-3 rounded-lg border border-[#DDDDDD] bg-white hover:bg-[#F9F9F9] transition-colors shadow-sm"
                  >
                    <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">...</svg>
                    <span className="text-[#1A1A1A] font-sans text-sm font-medium">
                      {loadingProvider === 'facebook' ? 'Redirecting…' : 'Sign in with Facebook'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Sign Up Link */}
              {/* <p className="text-center font-sans text-sm font-normal pt-4">
                <span className="text-[#888888]">Don't you have an account? </span>
                <button
                  onClick={() => setIsSignUp(true)}
                  className="text-[#1A1A1A] font-medium hover:underline"
                >
                  Sign up
                </button>
              </p> */}
              
              {/* Copyright Text */}
              <p className="text-center text-[#BBBBBB] text-xs font-normal mt-6">
                © 2025 ALL RIGHTS RESERVED
              </p>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}