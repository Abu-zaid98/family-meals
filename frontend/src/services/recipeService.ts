import axios from 'axios';
import type { Recipe, ApiResponse } from '../types';
import { auth } from '../lib/firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

async function getAuthHeader() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('Please sign in before managing recipes');
  }

  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export const recipeService = {
  async getAll(): Promise<Recipe[]> {
    const res = await api.get<ApiResponse<Recipe[]>>('/recipes');
    return res.data.data;
  },

  async getById(id: string): Promise<Recipe> {
    const res = await api.get<ApiResponse<Recipe>>(`/recipes/${id}`);
    return res.data.data;
  },

  async create(payload: {
    title: string;
    category: string;
    description: string;
    ingredients: string;
    steps: string;
  }): Promise<Recipe> {
    const authHeader = await getAuthHeader();
    const form = new FormData();
    form.append('title', payload.title);
    form.append('category', payload.category);
    form.append('description', payload.description);
    form.append('ingredients', payload.ingredients);
    form.append('steps', payload.steps);

    const res = await api.post<ApiResponse<Recipe>>('/recipes', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...authHeader,
      },
    });
    return res.data.data;
  },

  async update(id: string, payload: {
    title: string;
    category: string;
    description: string;
    ingredients: string;
    steps: string;
  }): Promise<Recipe> {
    const authHeader = await getAuthHeader();
    const res = await api.put<ApiResponse<Recipe>>(`/recipes/${id}`, payload, {
      headers: authHeader,
    });
    return res.data.data;
  },

  async remove(id: string): Promise<void> {
    const authHeader = await getAuthHeader();
    await api.delete(`/recipes/${id}`, { headers: authHeader });
  },
};
