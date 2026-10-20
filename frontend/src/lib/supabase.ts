import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// 환경 변수가 없으면 null (방명록 화면에서 안내 문구 표시)
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
