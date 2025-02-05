import { supabase } from './supabase';

export interface ApiKey {
  id: string;
  name: string;
  value: string;
  created_at: string;
  usage: number;
}

export const apiKeyService = {
  async fetchApiKeys() {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createApiKey(newKey: { name: string; value: string; usage: number }) {
    const { data, error } = await supabase
      .from('api_keys')
      .insert([newKey])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateApiKey(id: string, updates: { name: string; usage: number }) {
    const { error } = await supabase
      .from('api_keys')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteApiKey(id: string) {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async verifyApiKey(apiKey: string) {
    const { data, error } = await supabase
      .from('api_keys')
      .select('id')
      .eq('value', apiKey)
      .single();

    if (error) {
      return false;
    }
    return !!data;
  }
}; 