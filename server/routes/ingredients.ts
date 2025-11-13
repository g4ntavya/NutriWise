import { RequestHandler } from "express";
import { prisma } from "../lib/prisma";
import { optionalAuth } from "../middleware/auth";

export const listIngredients: RequestHandler = async (req, res) => {
  try {
    const { category, search, limit = "100", offset = "0" } = req.query;

    const where: any = {};

    if (category) {
      where.category = category as string;
    }

    if (search) {
      where.name = {
        contains: search as string,
        mode: "insensitive",
      };
    }

    const ingredients = await prisma.ingredient.findMany({
      where,
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: { name: "asc" },
    });

    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch ingredients" });
  }
};

export const getIngredient: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const ingredient = await prisma.ingredient.findUnique({
      where: { id },
    });

    if (!ingredient) {
      return res.status(404).json({ error: "Ingredient not found" });
    }

    res.json(ingredient);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch ingredient" });
  }
};

export const listIngredientsHandler = [optionalAuth, listIngredients];
export const getIngredientHandler = [optionalAuth, getIngredient];

