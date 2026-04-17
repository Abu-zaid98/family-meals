const { getDb } = require('../config/firebase');
const { uploadFile } = require('../services/storageService');

const COLLECTION = 'recipes';

function normalizeRecipes(data) {
  if (!data) return [];

  return Object.entries(data)
    .map(([id, recipe]) => ({
      id,
      category: recipe.category || 'عام',
      ...recipe,
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

async function getRecipeSnapshot(id) {
  const db = getDb();
  return db.ref(`${COLLECTION}/${id}`).once('value');
}

async function ensureOwnership(id, userId) {
  const snapshot = await getRecipeSnapshot(id);
  const recipe = snapshot.val();

  if (!recipe) {
    return { status: 404, body: { success: false, message: 'Recipe not found' } };
  }

  if (recipe.userId !== userId) {
    return { status: 403, body: { success: false, message: 'You can only manage your own recipes' } };
  }

  return { snapshot, recipe };
}

async function getAllRecipes(req, res) {
  try {
    const db = getDb();
    const snapshot = await db.ref(COLLECTION).once('value');
    const recipes = normalizeRecipes(snapshot.val());
    res.json({ success: true, data: recipes });
  } catch (err) {
    console.error('getAllRecipes error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getRecipeById(req, res) {
  try {
    const db = getDb();
    const snapshot = await db.ref(`${COLLECTION}/${req.params.id}`).once('value');
    const recipe = snapshot.val();

    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });

    res.json({ success: true, data: { id: req.params.id, ...recipe } });
  } catch (err) {
    console.error('getRecipeById error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function createRecipe(req, res) {
  try {
    const db = getDb();
    const { title, description, ingredients, steps, category } = req.body;
    const user = req.user;

    if (!title || !description || !ingredients || !steps || !category) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let imageUrl = null;
    let audioUrl = null;

    if (req.files?.image?.[0]) {
      try {
        const img = req.files.image[0];
        imageUrl = await uploadFile(img.buffer, img.mimetype, 'images');
      } catch (uploadError) {
        console.warn('Image upload skipped:', uploadError.message);
      }
    }

    if (req.files?.audio?.[0]) {
      try {
        const aud = req.files.audio[0];
        audioUrl = await uploadFile(aud.buffer, aud.mimetype || 'audio/webm', 'audio');
      } catch (uploadError) {
        console.warn('Audio upload skipped:', uploadError.message);
      }
    }

    const recipe = {
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      ingredients: ingredients.trim(),
      steps: steps.trim(),
      imageUrl,
      audioUrl,
      createdAt: new Date().toISOString(),
      userId: user.uid,
      authorName: user.name || user.email || 'Community Cook',
      authorEmail: user.email || null,
    };

    const docRef = db.ref(COLLECTION).push();
    await docRef.set(recipe);

    res.status(201).json({ success: true, data: { id: docRef.key, ...recipe } });
  } catch (err) {
    console.error('createRecipe error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateRecipe(req, res) {
  try {
    const { title, category, description, ingredients, steps } = req.body;

    if (!title || !description || !ingredients || !steps || !category) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const ownership = await ensureOwnership(req.params.id, req.user.uid);
    if ('status' in ownership) {
      return res.status(ownership.status).json(ownership.body);
    }

    const updatedRecipe = {
      ...ownership.recipe,
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      ingredients: ingredients.trim(),
      steps: steps.trim(),
      updatedAt: new Date().toISOString(),
    };

    await getDb().ref(`${COLLECTION}/${req.params.id}`).set(updatedRecipe);
    res.json({ success: true, data: { id: req.params.id, ...updatedRecipe } });
  } catch (err) {
    console.error('updateRecipe error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteRecipe(req, res) {
  try {
    const ownership = await ensureOwnership(req.params.id, req.user.uid);
    if ('status' in ownership) {
      return res.status(ownership.status).json(ownership.body);
    }

    await getDb().ref(`${COLLECTION}/${req.params.id}`).remove();
    res.json({ success: true, message: 'Recipe deleted' });
  } catch (err) {
    console.error('deleteRecipe error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getAllRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe };
