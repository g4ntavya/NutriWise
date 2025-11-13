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
interface LoginOverlayProps {
  trigger?: React.ReactNode;
  // Optional controlled props (Index page used these)
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function LoginOverlay({ trigger, isOpen, onClose, onSuccess }: LoginOverlayProps) {
  const [isSignUp, setIsSignUp] = useState(false);
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
            // Updated container style for the new design
            "max-w-[1000px] w-full p-0 border-0 bg-transparent shadow-none overflow-hidden" 
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
            <div className="lg:w-1/2 flex flex-col gap-6 p-12">
              
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

              {/* Form */}
              <div className="flex flex-col gap-4">
                {/* Email Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#1A1A1A] font-sans text-sm font-medium">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    // Styling to match the reference image's input
                    className="h-10 rounded-lg border border-[#DDDDDD] bg-white px-3 text-sm placeholder:text-[#BBBBBB] focus:ring-2 focus:ring-[#1A1A1A]"
                  />
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#1A1A1A] font-sans text-sm font-medium">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="At least 8 characters"
                    // Styling to match the reference image's input
                    className="h-10 rounded-lg border border-[#DDDDDD] bg-white px-3 text-sm placeholder:text-[#BBBBBB] focus:ring-2 focus:ring-[#1A1A1A]"
                  />
                </div>

                {/* Forgot Password Link - moved outside of button flow */}
                <div className="text-right">
                  <button className="text-[#1A1A1A] font-sans text-xs font-medium hover:underline">
                    Forgot Password?
                  </button>
                </div>

                {/* Sign In Button (Primary) */}
                <button
                  // Styling to match the dark primary button
                  className="flex items-center justify-center py-2.5 rounded-lg bg-[#1A1A1A] text-white font-sans text-base font-medium tracking-tight hover:bg-[#333333] transition-colors shadow-md"
                  onClick={() => {
                    // Simulate successful login — call parent callback if provided
                    if (onSuccess) onSuccess();
                    // Close dialog if uncontrolled
                    handleOpenChange(false);
                  }}
                >
                  Sign in
                </button>
              </div>

              {/* Social Sign In */}
              <div className="flex flex-col gap-4">
                {/* Divider */}
                <div className="flex items-center justify-center gap-3 py-2">
                  <div className="flex-1 h-px bg-[#DDDDDD]"></div>
                  <span className="text-[#BBBBBB] text-center font-sans text-sm font-normal">
                    Or
                  </span>
                  <div className="flex-1 h-px bg-[#DDDDDD]"></div>
                </div>

                {/* Social Buttons */}
                <div className="flex flex-col gap-3">
                  {/* Google Button - Light style */}
                  <button className="flex items-center justify-center gap-3 py-2.5 px-1.5 rounded-lg border border-[#DDDDDD] bg-white hover:bg-[#F9F9F9] transition-colors shadow-sm">
                    {/* SVG content remains the same */}
                    <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">...</svg> 
                    <span className="text-[#1A1A1A] font-sans text-sm font-medium">
                      Sign in with Google
                    </span>
                  </button>

                  {/* Facebook Button - Light style */}
                  <button className="flex items-center justify-center gap-3 py-2.5 px-1.5 rounded-lg border border-[#DDDDDD] bg-white hover:bg-[#F9F9F9] transition-colors shadow-sm">
                    {/* SVG content remains the same */}
                    <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">...</svg>
                    <span className="text-[#1A1A1A] font-sans text-sm font-medium">
                      Sign in with Facebook
                    </span>
                  </button>
                </div>
              </div>

              {/* Sign Up Link */}
              <p className="text-center font-sans text-sm font-normal pt-4">
                <span className="text-[#888888]">Don't you have an account? </span>
                <button
                  onClick={() => setIsSignUp(true)}
                  className="text-[#1A1A1A] font-medium hover:underline"
                >
                  Sign up
                </button>
              </p>
              
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