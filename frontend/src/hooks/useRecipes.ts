import { useState, useEffect, useCallback } from 'react';
import { recipeService } from '../services/recipeService';
import type { Recipe } from '../types';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await recipeService.getAll();
      setRecipes(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  const addRecipe = (recipe: Recipe) => {
    setRecipes(prev => [recipe, ...prev]);
  };

  const updateRecipe = (recipe: Recipe) => {
    setRecipes(prev => prev.map(item => item.id === recipe.id ? recipe : item));
  };

  const removeRecipe = (id: string) => {
    setRecipes(prev => prev.filter(item => item.id !== id));
  };

  return { recipes, loading, error, refetch: fetchRecipes, addRecipe, updateRecipe, removeRecipe };
}
