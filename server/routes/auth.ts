import { RequestHandler } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { findOrCreateUser, createTokenPair } from "../services/auth.service";
import { AuthProvider } from "@prisma/client";

// Serialize/deserialize user for Passport sessions (not used but required)
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const { prisma } = await import("../lib/prisma");
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Configure Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateUser(AuthProvider.GOOGLE, {
          id: profile.id,
          email: profile.emails?.[0]?.value || "",
          name: profile.displayName,
          picture: profile.photos?.[0]?.value,
        });
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Configure Facebook OAuth
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID || "",
      clientSecret: process.env.FACEBOOK_APP_SECRET || "",
      callbackURL: "/api/auth/facebook/callback",
      profileFields: ["id", "emails", "name", "picture.type(large)"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateUser(AuthProvider.FACEBOOK, {
          id: profile.id,
          email: profile.emails?.[0]?.value || "",
          name: `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`.trim(),
          picture: profile.photos?.[0]?.value,
        });
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export const handleGoogleAuth: RequestHandler = (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: req.query.redirect as string,
  })(req, res, next);
};

export const handleGoogleCallback: RequestHandler = async (req, res, next) => {
  passport.authenticate("google", async (err, user) => {
    if (err || !user) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=auth_failed`
      );
    }

    try {
      const { accessToken, refreshToken } = await createTokenPair(
        user.id,
        user.email
      );

      const redirectUrl = req.query.state as string || process.env.FRONTEND_URL || "http://localhost:5173";
      
      // Set cookies
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.redirect(`${redirectUrl}/auth/callback?token=${accessToken}`);
    } catch (error) {
      res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=token_error`
      );
    }
  })(req, res, next);
};

export const handleFacebookAuth: RequestHandler = (req, res, next) => {
  passport.authenticate("facebook", {
    scope: ["email"],
    state: req.query.redirect as string,
  })(req, res, next);
};

export const handleFacebookCallback: RequestHandler = async (req, res, next) => {
  passport.authenticate("facebook", async (err, user) => {
    if (err || !user) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=auth_failed`
      );
    }

    try {
      const { accessToken, refreshToken } = await createTokenPair(
        user.id,
        user.email
      );

      const redirectUrl = req.query.state as string || process.env.FRONTEND_URL || "http://localhost:5173";
      
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.redirect(`${redirectUrl}/auth/callback?token=${accessToken}`);
    } catch (error) {
      res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=token_error`
      );
    }
  })(req, res, next);
};

export const handleRefreshToken: RequestHandler = async (req, res) => {
  try {
    const { refreshToken } = await import("../services/auth.service");
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      return res.status(401).json({ error: "Refresh token required" });
    }

    const { accessToken } = await refreshToken(token);
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
};

export const handleLogout: RequestHandler = async (req, res) => {
  try {
    const { revokeRefreshToken } = await import("../services/auth.service");
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (token) {
      await revokeRefreshToken(token);
    }

    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Logout failed" });
  }
};

