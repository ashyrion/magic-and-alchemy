import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Item, Material, Recipe } from '../types/gameTypes';
import type { CraftingState } from './types';

interface CraftingStore extends CraftingState {
  addKnownRecipe: (recipe: Recipe) => void;
  setSelectedRecipe: (recipe: Recipe | null) => void;
  addSelectedMaterial: (material: Material) => void;
  clearSelectedMaterials: () => void;
  addToCraftingQueue: (recipe: Recipe, materials: Material[]) => void;
  updateCraftingProgress: (recipeId: string, progress: number) => void;
  addDiscoveredEffect: (effectId: string) => void;
  addDiscoveredRecipe: (recipe: Recipe) => void;
  setCraftingResult: (result: Item | null) => void;
  addToCraftingHistory: (recipe: Recipe, materials: Material[], result: Item) => void;
}

export const useCraftingStore = create<CraftingStore>()(
  devtools(
    (set) => ({
      // 상태
      knownRecipes: [],
      selectedRecipe: null,
      selectedMaterials: [],
      craftingQueue: [],
      discoveredEffects: [],
      discoveredRecipes: [],
      craftingResult: null,
      craftingHistory: [],

      // 액션
      addKnownRecipe: (recipe: Recipe) =>
        set((state) => ({
          knownRecipes: [...state.knownRecipes, recipe]
        })),
      setSelectedRecipe: (recipe: Recipe | null) =>
        set({ selectedRecipe: recipe }),
      addSelectedMaterial: (material: Material) =>
        set((state) => ({
          selectedMaterials: [...state.selectedMaterials, material]
        })),
      clearSelectedMaterials: () =>
        set({ selectedMaterials: [] }),
      addToCraftingQueue: (recipe: Recipe, materials: Material[]) =>
        set((state) => ({
          craftingQueue: [
            ...state.craftingQueue,
            { recipe, materials, progress: 0 }
          ]
        })),
      updateCraftingProgress: (recipeId: string, progress: number) =>
        set((state) => ({
          craftingQueue: state.craftingQueue.map(item => 
            item.recipe.id === recipeId 
              ? { ...item, progress }
              : item
          )
        })),
      addDiscoveredEffect: (effectId: string) =>
        set((state) => ({
          discoveredEffects: [...state.discoveredEffects, effectId]
        })),
      addDiscoveredRecipe: (recipe: Recipe) =>
        set((state) => ({
          discoveredRecipes: [...state.discoveredRecipes, recipe]
        })),
      setCraftingResult: (result: Item | null) =>
        set({ craftingResult: result }),
      addToCraftingHistory: (recipe: Recipe, materials: Material[], result: Item) =>
        set((state) => ({
          craftingHistory: [
            ...state.craftingHistory,
            { recipe, materials, result, timestamp: Date.now() }
          ]
        })),
    }),
    {
      name: 'CraftingStore',
    }
  )
);