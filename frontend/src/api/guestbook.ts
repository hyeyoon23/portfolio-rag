import { supabase } from "@/lib/supabase";

export interface GuestbookEntry {
  id: number;
  name: string;
  message: string;
  created_at: string;
}

export const GUESTBOOK_PAGE_SIZE = 20;
export const GUESTBOOK_NAME_MAX = 20;
export const GUESTBOOK_MESSAGE_MAX = 300;

const UNAVAILABLE_MESSAGE =
  "지금은 방명록을 사용할 수 없어요. 잠시 후 다시 시도해 주세요.";

export const isGuestbookAvailable = supabase !== null;

// 최신순. beforeId를 주면 그보다 오래된 글을 이어서 불러옴
export async function fetchGuestbook(
  beforeId?: number,
): Promise<GuestbookEntry[]> {
  if (!supabase) throw new Error(UNAVAILABLE_MESSAGE);

  let query = supabase
    .from("guestbook")
    .select("id, name, message, created_at")
    .order("id", { ascending: false })
    .limit(GUESTBOOK_PAGE_SIZE);
  if (beforeId !== undefined) query = query.lt("id", beforeId);

  const { data, error } = await query;
  if (error) throw new Error(UNAVAILABLE_MESSAGE);
  return data;
}

export async function createGuestbookEntry(
  name: string,
  message: string,
): Promise<void> {
  if (!supabase) throw new Error(UNAVAILABLE_MESSAGE);

  const { error } = await supabase
    .from("guestbook")
    .insert({ name: name.trim(), message: message.trim() });

  if (error) {
    // DB 도배 방지 트리거에 걸린 경우
    if (error.message.includes("rate limit")) {
      throw new Error("지금 방명록이 붐벼요. 잠시 후 다시 남겨 주세요.");
    }
    throw new Error("방명록을 남기지 못했어요. 잠시 후 다시 시도해 주세요.");
  }
}
