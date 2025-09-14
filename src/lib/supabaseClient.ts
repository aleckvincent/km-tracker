import { createClient } from "@supabase/supabase-js";
import { toCamelCase } from "./camelize";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;


export const supabase = createClient(supabaseUrl, supabaseKey);

// A helper function for queries that auto-camelizes
export async function fetchTable<T>(table: string, query = "*") {
  const { data, error } = await supabase.from(table).select(query);
  if (error) throw error;
  return toCamelCase(data) as T[];
}

