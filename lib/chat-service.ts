import { supabase } from "./supabase"

export async function getChatHistory(userId: string, limit = 20) {
  try {
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("user_id", userId)
      .order("importance", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching chat history:", error)
    return []
  }
}

export async function saveChatMessage(userId: string, message: string, response: string, language = "en") {
  try {
    const { error } = await supabase.from("chats").insert({
      user_id: userId,
      message,
      response,
      language,
      importance: 1.0,
    })

    if (error) throw error
  } catch (error) {
    console.error("Error saving chat message:", error)
    throw error
  }
}
