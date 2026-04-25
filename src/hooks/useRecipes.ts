import { useState, useEffect } from 'react';
import { recipeService } from '../services/recipeService';
import type { Recipe } from '../types';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = recipeService.subscribeToAllRecipes(
      (data) => {
        setRecipes(data);
        setError(null);
        setLoading(false);
      },
      (message) => {
        setError(message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { recipes, loading, error };
}
