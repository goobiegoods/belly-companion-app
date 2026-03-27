import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SavedRecipesContextType {
  savedIds: Set<string>;
  toggleSave: (recipeId: string) => void;
  loading: boolean;
}

const SavedRecipesContext = createContext<SavedRecipesContextType>({
  savedIds: new Set(),
  toggleSave: () => {},
  loading: true,
});

export const useSavedRecipes = () => useContext(SavedRecipesContext);

export const SavedRecipesProvider = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) { setSavedIds(new Set()); setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from('saved_recipes')
        .select('recipe_id')
        .eq('user_id', session.user.id);
      setSavedIds(new Set((data || []).map(r => r.recipe_id)));
      setLoading(false);
    })();
  }, [session?.user?.id]);

  const toggleSave = useCallback(async (recipeId: string) => {
    if (!session?.user?.id) return;
    const userId = session.user.id;
    const isSaved = savedIds.has(recipeId);

    // Optimistic update
    setSavedIds(prev => {
      const next = new Set(prev);
      if (isSaved) next.delete(recipeId);
      else next.add(recipeId);
      return next;
    });

    if (isSaved) {
      await supabase.from('saved_recipes').delete().eq('user_id', userId).eq('recipe_id', recipeId);
    } else {
      await supabase.from('saved_recipes').insert({ user_id: userId, recipe_id: recipeId });
    }
  }, [session?.user?.id, savedIds]);

  return (
    <SavedRecipesContext.Provider value={{ savedIds, toggleSave, loading }}>
      {children}
    </SavedRecipesContext.Provider>
  );
};
