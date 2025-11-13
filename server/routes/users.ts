import { RequestHandler } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const updatePreferencesSchema = z.object({
  budgetDefault: z.number().min(500).max(10000).optional(),
  dietaryPreferences: z.array(z.string()).optional(),
  healthGoals: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
});

export const getCurrentUser: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        budgetDefault: true,
        dietaryPreferences: true,
        healthGoals: true,
        allergies: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const updatePreferences: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const body = updatePreferencesSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(body.budgetDefault !== undefined && { budgetDefault: body.budgetDefault }),
        ...(body.dietaryPreferences !== undefined && { dietaryPreferences: body.dietaryPreferences }),
        ...(body.healthGoals !== undefined && { healthGoals: body.healthGoals }),
        ...(body.allergies !== undefined && { allergies: body.allergies }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        budgetDefault: true,
        dietaryPreferences: true,
        healthGoals: true,
        allergies: true,
      },
    });

    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to update preferences" });
  }
};

// Apply auth middleware
export const getCurrentUserHandler = [authenticateToken, getCurrentUser];
export const updatePreferencesHandler = [authenticateToken, updatePreferences];

