import { API_BASE_URL, API_URL } from "../config/api";

const wsBaseUrl = API_BASE_URL.replace(/^http/i, "ws");

export const createChatSocket = (memberId) => {
  return new WebSocket(`${wsBaseUrl}/ws/chat?memberId=${encodeURIComponent(memberId)}`);
};

export const getConversation = async (memberA, memberB) => {
  const res = await fetch(
    `${API_URL}/chat/messages?memberA=${encodeURIComponent(memberA)}&memberB=${encodeURIComponent(memberB)}`
  );
  if (!res.ok) throw new Error("Failed to load chat messages");
  return res.json();
};

export const getConversationSummaries = async (memberId) => {
  const res = await fetch(`${API_URL}/chat/conversations/${encodeURIComponent(memberId)}`);
  if (!res.ok) throw new Error("Failed to load chat conversations");
  return res.json();
};

export const sendChatMessage = async ({ senderId, recipientId, content }) => {
  const res = await fetch(`${API_URL}/chat/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ senderId, recipientId, content }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
};

export const markConversationRead = async (currentMemberId, otherMemberId) => {
  const res = await fetch(
    `${API_URL}/chat/read?currentMemberId=${encodeURIComponent(currentMemberId)}&otherMemberId=${encodeURIComponent(otherMemberId)}`,
    { method: "PUT" }
  );
  if (!res.ok) throw new Error("Failed to mark messages read");
  return res.json();
};
