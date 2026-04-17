const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');
const { getAllRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe } = require('../controllers/recipeController');

router.get('/', getAllRecipes);
router.get('/:id', getRecipeById);
router.post('/', requireAuth, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), createRecipe);
router.put('/:id', requireAuth, updateRecipe);
router.delete('/:id', requireAuth, deleteRecipe);

module.exports = router;
