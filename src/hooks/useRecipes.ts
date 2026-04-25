import { useState, useEffect } from 'react';
import { recipeService } from '../services/recipeService';
import type { Recipe } from '../types';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Subscribe to all recipes in real-time
    const unsubscribe = recipeService.subscribeToAllRecipes((data) => {
      setRecipes(data);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { recipes, loading, error };
}
