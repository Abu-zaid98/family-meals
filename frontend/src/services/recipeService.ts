import { ref, push, set, remove, onValue, get } from 'firebase/database';
import type { Recipe } from '../types';
import { db, auth } from '../lib/firebase';

export const recipeService = {
  /**
   * Create a new recipe in RTDB at recipes/{userId}/{recipeId}
   */
  async create(payload: {
    title: string;
    category: string;
    description: string;
    ingredients: string;
    steps: string;
  }): Promise<Recipe> {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in to create a recipe');

    const recipeRef = ref(db, `recipes/${user.uid}`);
    const newRecipeRef = push(recipeRef);
    const recipeId = newRecipeRef.key as string;

    const recipe: Recipe = {
      id: recipeId,
      ...payload,
      imageUrl: null,
      audioUrl: null,
      createdAt: new Date().toISOString(),
      userId: user.uid,
      authorName: user.displayName || 'Community Cook',
      authorEmail: user.email || null,
    };

    await set(newRecipeRef, recipe);
    return recipe;
  },

  /**
   * Subscribe to real-time updates for recipes of a specific user (or current user if not provided)
   */
  subscribeToRecipes(callback: (recipes: Recipe[]) => void, userId?: string) {
    const uid = userId || auth.currentUser?.uid;
    if (!uid) return () => {};

    const recipeRef = ref(db, `recipes/${uid}`);
    
    return onValue(recipeRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }

      const recipes: Recipe[] = Object.entries(data).map(([id, val]: [string, any]) => ({
        ...val,
        id,
      })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      callback(recipes);
    });
  },

  /**
   * Get all recipes for all users (Admin view or global feed)
   * Note: This might be expensive if data is huge, but fine for small apps.
   */
  subscribeToAllRecipes(callback: (recipes: Recipe[]) => void) {
    const recipesRef = ref(db, 'recipes');

    return onValue(recipesRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }

      // data is { userId: { recipeId: recipe } }
      const allRecipes: Recipe[] = [];
      Object.values(data).forEach((userRecipes: any) => {
        Object.entries(userRecipes).forEach(([id, val]: [string, any]) => {
          allRecipes.push({ ...val, id });
        });
      });

      allRecipes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(allRecipes);
    });
  },

  async update(id: string, payload: Partial<Recipe>): Promise<Recipe> {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in to update a recipe');

    const current = await this.getById(id, user.uid);
    const updatedRecipe: Recipe = {
      ...current,
      ...payload,
      // Ensure ID and userId don't change
      id,
      userId: user.uid,
    };

    const recipeRef = ref(db, `recipes/${user.uid}/${id}`);
    await set(recipeRef, updatedRecipe);
    return updatedRecipe;
  },

  async remove(id: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in to delete a recipe');

    const recipeRef = ref(db, `recipes/${user.uid}/${id}`);
    await remove(recipeRef);
  },

  async getById(id: string, userId?: string): Promise<Recipe> {
    const uid = userId || auth.currentUser?.uid;
    if (!uid) throw new Error('User context missing');

    const recipeRef = ref(db, `recipes/${uid}/${id}`);
    const snapshot = await get(recipeRef);
    const data = snapshot.val();

    if (!data) throw new Error('Recipe not found');
    return { ...data, id };
  }
};
