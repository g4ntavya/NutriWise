import { RequestHandler } from "express";
import { prisma } from "../lib/prisma";
import { optionalAuth } from "../middleware/auth";

export const listRecipes: RequestHandler = async (req, res) => {
  try {
    const {
      cuisine,
      tags,
      minRating,
      search,
      limit = "50",
      offset = "0",
    } = req.query;

    const where: any = {};

    if (cuisine) {
      where.cuisine = cuisine as string;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      where.tags = {
        hasSome: tagArray as string[],
      };
    }

    if (minRating) {
      where.avgRating = {
        gte: parseFloat(minRating as string),
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const recipes = await prisma.recipe.findMany({
      where,
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: { avgRating: "desc" },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
};

export const getRecipe: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
        feedbacks: {
          take: 10,
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
        },
      },
    });

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recipe" });
  }
};

export const listRecipeHandler = [optionalAuth, listRecipes];
export const getRecipeHandler = [optionalAuth, getRecipe];

