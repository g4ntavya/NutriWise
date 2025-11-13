"""
Vector service for content-based filtering using cosine similarity
Creates nutrition/ingredient vectors for recommendation system
"""
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Optional, Tuple
import pandas as pd

class NutritionVectorizer:
    """Creates and manages nutrition vectors for ingredients and recipes"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.feature_names = [
            'calories',
            'protein',
            'carbs',
            'fat',
            'fiber',
            'calcium',
            'iron',
            'vitamin_c'
        ]
    
    def create_ingredient_vector(
        self,
        calories: float,
        protein: float,
        carbs: float,
        fat: float,
        fiber: Optional[float] = None,
        calcium: Optional[float] = None,
        iron: Optional[float] = None,
        vitamin_c: Optional[float] = None
    ) -> np.ndarray:
        """
        Create normalized nutrition vector for an ingredient
        
        Args:
            calories, protein, carbs, fat: Required nutrition values
            fiber, calcium, iron, vitamin_c: Optional micronutrients
            
        Returns:
            Normalized 8-dimensional vector
        """
        vector = np.array([
            calories / 100,  # Normalize per 100g
            protein,
            carbs,
            fat,
            fiber or 0.0,
            (calcium or 0.0) / 100,  # Normalize
            (iron or 0.0) / 10,  # Normalize
            (vitamin_c or 0.0) / 10  # Normalize
        ])
        
        return vector
    
    def create_recipe_vector(
        self,
        ingredients: List[Dict],
        servings: float = 1.0
    ) -> np.ndarray:
        """
        Create aggregated nutrition vector for a recipe
        
        Args:
            ingredients: List of dicts with nutrition data
            servings: Number of servings
            
        Returns:
            Aggregated and normalized vector
        """
        total_vector = np.zeros(8)
        
        for ingredient in ingredients:
            vector = self.create_ingredient_vector(
                calories=ingredient.get('calories', 0),
                protein=ingredient.get('protein', 0),
                carbs=ingredient.get('carbs', 0),
                fat=ingredient.get('fat', 0),
                fiber=ingredient.get('fiber'),
                calcium=ingredient.get('calcium'),
                iron=ingredient.get('iron'),
                vitamin_c=ingredient.get('vitamin_c')
            )
            quantity = ingredient.get('quantity', 0)
            total_vector += vector * (quantity / 100)  # Scale by quantity
        
        # Normalize by servings
        return total_vector / servings
    
    def create_user_preference_vector(
        self,
        calorie_target: float,
        protein_ratio: float = 0.3,
        carbs_ratio: float = 0.4,
        fat_ratio: float = 0.3,
        preferences: Optional[Dict] = None
    ) -> np.ndarray:
        """
        Create user preference vector based on goals
        
        Args:
            calorie_target: Daily calorie target
            protein_ratio: Protein percentage (default 30%)
            carbs_ratio: Carbs percentage (default 40%)
            fat_ratio: Fat percentage (default 30%)
            preferences: Additional preferences dict
            
        Returns:
            User preference vector
        """
        # Calculate macro targets
        protein_target = (calorie_target * protein_ratio) / 4  # 4 cal/g
        carbs_target = (calorie_target * carbs_ratio) / 4  # 4 cal/g
        fat_target = (calorie_target * fat_ratio) / 9  # 9 cal/g
        
        vector = np.array([
            calorie_target / 100,
            protein_target,
            carbs_target,
            fat_target,
            preferences.get('fiber_preference', 25.0) if preferences else 25.0,
            preferences.get('calcium_preference', 1000.0) / 100 if preferences else 10.0,
            preferences.get('iron_preference', 15.0) / 10 if preferences else 1.5,
            preferences.get('vitamin_c_preference', 90.0) / 10 if preferences else 9.0
        ])
        
        return vector

class CosineSimilarityRecommender:
    """Content-based filtering using cosine similarity"""
    
    def __init__(self):
        self.vectorizer = NutritionVectorizer()
    
    def calculate_similarity(
        self,
        vector1: np.ndarray,
        vector2: np.ndarray
    ) -> float:
        """
        Calculate cosine similarity between two vectors
        
        Returns:
            Similarity score between 0 and 1
        """
        # Reshape for sklearn
        v1 = vector1.reshape(1, -1)
        v2 = vector2.reshape(1, -1)
        
        similarity = cosine_similarity(v1, v2)[0][0]
        return float(similarity)
    
    def find_similar_recipes(
        self,
        user_vector: np.ndarray,
        recipe_vectors: List[Tuple[str, np.ndarray]],
        top_k: int = 10
    ) -> List[Tuple[str, float]]:
        """
        Find top-k most similar recipes to user preferences
        
        Args:
            user_vector: User preference vector
            recipe_vectors: List of (recipe_id, vector) tuples
            top_k: Number of top recommendations
            
        Returns:
            List of (recipe_id, similarity_score) tuples, sorted by similarity
        """
        similarities = []
        
        for recipe_id, recipe_vector in recipe_vectors:
            similarity = self.calculate_similarity(user_vector, recipe_vector)
            similarities.append((recipe_id, similarity))
        
        # Sort by similarity (descending)
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        return similarities[:top_k]
    
    def find_similar_ingredients(
        self,
        ingredient_vector: np.ndarray,
        ingredient_vectors: List[Tuple[str, np.ndarray]],
        top_k: int = 5
    ) -> List[Tuple[str, float]]:
        """
        Find similar ingredients (for substitutions)
        
        Args:
            ingredient_vector: Source ingredient vector
            ingredient_vectors: List of (ingredient_id, vector) tuples
            top_k: Number of top matches
            
        Returns:
            List of (ingredient_id, similarity_score) tuples
        """
        similarities = []
        
        for ing_id, ing_vector in ingredient_vectors:
            similarity = self.calculate_similarity(ingredient_vector, ing_vector)
            similarities.append((ing_id, similarity))
        
        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:top_k]

