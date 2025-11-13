import { prisma } from "../lib/prisma";
import { generateAccessToken, generateRefreshToken, TokenPayload } from "../lib/jwt";
import { AuthProvider } from "@prisma/client";

export interface OAuthProfile {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

export async function findOrCreateUser(
  provider: AuthProvider,
  profile: OAuthProfile
) {
  // Try to find existing user by provider ID
  let user = await prisma.user.findUnique({
    where: { providerId: `${provider}:${profile.id}` },
  });

  if (user) {
    return user;
  }

  // Try to find by email
  user = await prisma.user.findUnique({
    where: { email: profile.email },
  });

  if (user) {
    // Update existing user with provider info
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        providerId: `${provider}:${profile.id}`,
        authProvider: provider,
        name: profile.name || user.name,
        avatarUrl: profile.picture || user.avatarUrl,
      },
    });
    return user;
  }

  // Create new user
  user = await prisma.user.create({
    data: {
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.picture,
      authProvider: provider,
      providerId: `${provider}:${profile.id}`,
    },
  });

  return user;
}

export async function createTokenPair(userId: string, email: string) {
  const payload: TokenPayload = { userId, email };
  
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store refresh token in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt,
    },
  });

  return { accessToken, refreshToken };
}

export async function refreshAccessToken(refreshToken: string) {
  const { verifyRefreshToken } = await import("../lib/jwt");
  const payload = verifyRefreshToken(refreshToken);

  // Verify token exists in database
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
    throw new Error("Invalid or expired refresh token");
  }

  // Generate new access token
  const newAccessToken = generateAccessToken({
    userId: payload.userId,
    email: payload.email,
  });

  return { accessToken: newAccessToken };
}

export async function revokeRefreshToken(refreshToken: string) {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
}

export async function revokeAllUserTokens(userId: string) {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
}

