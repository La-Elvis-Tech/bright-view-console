import { supabase } from '@/integrations/supabase/client';
import { InventoryItem, InventoryCategory, InventoryMovement } from '@/types/inventory';

export const getUserUnit = async (): Promise<{ id: string; name: string } | null> => {
  try {
    console.log('Getting current user...');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No authenticated user found');
      return null;
    }

    console.log('User found:', user.email);

    // Primeiro, tentar buscar a unidade do perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('unit_id')
      .eq('id', user.id)
      .single();

    console.log('Profile query result:', { profile, profileError });

    if (profile?.unit_id) {
      const { data: unit, error: unitError } = await supabase
        .from('units')
        .select('id, name')
        .eq('id', profile.unit_id)
        .single();

      console.log('Unit from profile:', { unit, unitError });

      if (unit && !unitError) {
        return unit;
      }
    }

    // Se não encontrou unidade no perfil, buscar a primeira unidade disponível
    console.log('No unit in profile, getting first available unit...');
    const { data: units, error: unitsError } = await supabase
      .from('units')
      .select('id, name')
      .eq('active', true)
      .limit(1);

    console.log('Available units:', { units, unitsError });

    if (units && units.length > 0 && !unitsError) {
      return units[0];
    }

    console.log('No units found');
    return null;
  } catch (error) {
    console.error('Error in getUserUnit:', error);
    throw error;
  }
};

export const fetchInventoryItems = async (unitId: string): Promise<InventoryItem[]> => {
  try {
    console.log('Fetching inventory items for unit:', unitId);
    
    const { data, error } = await supabase
      .from('inventory_items')
      .select(`
        *,
        categories:inventory_categories(id, name, color)
      `)
      .eq('unit_id', unitId)
      .eq('active', true)
      .order('name');

    console.log('Inventory items query result:', { data, error });

    if (error) {
      console.error('Error fetching inventory items:', error);
      throw error;
    }

    const items = data?.map(item => ({
      ...item,
      // Map unit_measure to unit for type compatibility
      unit: item.unit_measure || '',
      // Map storage_location to location for type compatibility
      location: item.storage_location,
    })) || [];

    console.log('Mapped inventory items:', items.length, 'items');
    return items;
  } catch (error) {
    console.error('Error in fetchInventoryItems:', error);
    throw error;
  }
};

export const fetchInventoryCategories = async (): Promise<InventoryCategory[]> => {
  try {
    console.log('Fetching inventory categories...');
    
    const { data, error } = await supabase
      .from('inventory_categories')
      .select('id, name, description, color, icon, created_at')
      .order('name');

    console.log('Categories query result:', { data, error });

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    // Map database data to match InventoryCategory type
    const categories = data?.map(category => ({
      ...category,
      active: true, // Default value since this field doesn't exist in DB
      updated_at: category.created_at, // Use created_at as fallback for updated_at
      description: category.description || '', // Ensure description is not null
    })) || [];

    console.log('Fetched categories:', categories.length, 'categories');
    return categories;
  } catch (error) {
    console.error('Error in fetchInventoryCategories:', error);
    throw error;
  }
};

export const createInventoryItem = async (
  item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>,
  unitId: string
): Promise<InventoryItem> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .insert({
      ...item,
      unit_id: unitId,
      storage_location: item.location,
      unit_measure: item.unit,
    })
    .select()
    .single();

  if (error) throw error;
  
  // Map the returned data to match InventoryItem type
  return {
    ...data,
    unit: data.unit_measure || '',
    location: data.storage_location,
  };
};

export const updateInventoryItem = async (
  id: string,
  updates: Partial<InventoryItem>
): Promise<InventoryItem> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .update({
      ...updates,
      storage_location: updates.location,
      unit_measure: updates.unit,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  // Map the returned data to match InventoryItem type
  return {
    ...data,
    unit: data.unit_measure || '',
    location: data.storage_location,
  };
};

export const deleteInventoryItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const addInventoryMovement = async (movement: Omit<InventoryMovement, 'id' | 'created_at'>): Promise<void> => {
  const { error } = await supabase
    .from('inventory_movements')
    .insert(movement);

  if (error) throw error;
};
