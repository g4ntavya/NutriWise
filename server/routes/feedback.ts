import { RequestHandler } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const createFeedbackSchema = z.object({
  mealPlanId: z.string().uuid().optional(),
  recipeId: z.string().uuid().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const createFeedback: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const body = createFeedbackSchema.parse(req.body);

    if (!body.mealPlanId && !body.recipeId) {
      return res.status(400).json({ error: "Either mealPlanId or recipeId is required" });
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: req.user!.id,
        mealPlanId: body.mealPlanId,
        recipeId: body.recipeId,
        rating: body.rating,
        comment: body.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Update recipe rating if applicable
    if (body.recipeId) {
      const recipe = await prisma.recipe.findUnique({
        where: { id: body.recipeId },
        include: {
          feedbacks: true,
        },
      });

      if (recipe) {
        const avgRating =
          recipe.feedbacks.reduce((sum, f) => sum + f.rating, 0) /
          recipe.feedbacks.length;

        await prisma.recipe.update({
          where: { id: body.recipeId },
          data: { avgRating },
        });
      }
    }

    res.status(201).json(feedback);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to create feedback" });
  }
};

export const getFeedback: RequestHandler = async (req, res) => {
  try {
    const { mealPlanId, recipeId } = req.query;

    if (!mealPlanId && !recipeId) {
      return res.status(400).json({ error: "Either mealPlanId or recipeId is required" });
    }

    const where: any = {};
    if (mealPlanId) where.mealPlanId = mealPlanId as string;
    if (recipeId) where.recipeId = recipeId as string;

    const feedbacks = await prisma.feedback.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
};

export const createFeedbackHandler = [authenticateToken, createFeedback];
export const getFeedbackHandler = [getFeedback];

