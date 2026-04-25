export interface Recipe {
  id: string;
  title: string;
  category: string;
  description: string;
  ingredients: string;
  steps: string;
  imageUrl: string | null;
  audioUrl: string | null;
  createdAt: string;
  userId: string;
  authorName: string;
  authorEmail: string | null;
}

export interface CreateRecipePayload {
  title: string;
  category: string;
  description: string;
  ingredients: string;
  steps: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
