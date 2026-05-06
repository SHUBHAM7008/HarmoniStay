import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { getMembers } from "../service/memberService";
import {
  createChatSocket,
  getConversation,
  getConversationSummaries,
  markConversationRead,
  sendChatMessage,
} from "../service/chatService";

const outboxKey = (memberId) => `harmonystay-chat-outbox-${memberId}`;

const MemberChat = () => {
  const { user } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [outbox, setOutbox] = useState([]);
  const [conversationMeta, setConversationMeta] = useState({});
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const aTime = conversationMeta[a.id]?.lastMessageAt || "";
      const bTime = conversationMeta[b.id]?.lastMessageAt || "";
      if (aTime && bTime && aTime !== bTime) {
        return new Date(bTime) - new Date(aTime);
      }
      if (aTime && !bTime) return -1;
      if (!aTime && bTime) return 1;
      const aName = `${a.firstName || ""} ${a.lastName || ""}`.trim() || a.email || "";
      const bName = `${b.firstName || ""} ${b.lastName || ""}`.trim() || b.email || "";
      return aName.localeCompare(bName);
    });
  }, [conversationMeta, members]);

  const selectedMember = useMemo(
    () => members.find((member) => member.id === selectedMemberId),
    [members, selectedMemberId]
  );

  const updateConversationMetaFromMessage = useCallback((message) => {
    if (!message || !user?.id) return;
    const otherMemberId = message.senderId === user.id ? message.recipientId : message.senderId;
    setConversationMeta((prev) => ({
      ...prev,
      [otherMemberId]: {
        ...(prev[otherMemberId] || {}),
        lastMessage: message.content,
        lastMessageAt: message.sentAt || new Date().toISOString(),
        unreadCount: message.senderId === user.id ? 0 : (prev[otherMemberId]?.unreadCount || 0) + 1,
      },
    }));
  }, [user?.id]);

  const saveOutbox = useCallback((nextOutbox) => {
    setOutbox(nextOutbox);
    localStorage.setItem(outboxKey(user.id), JSON.stringify(nextOutbox));
  }, [user.id]);

  const loadConversation = useCallback(async (otherMemberId) => {
    if (!user?.id || !otherMemberId) return;
    setLoading(true);
    try {
      const data = await getConversation(user.id, otherMemberId);
      setMessages(Array.isArray(data) ? data : []);
      await markConversationRead(user.id, otherMemberId);
      setConversationMeta((prev) => ({
        ...prev,
        [otherMemberId]: {
          ...(prev[otherMemberId] || {}),
          unreadCount: 0,
        },
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const flushOutbox = useCallback(async () => {
    if (!user?.id) return;
    const queued = JSON.parse(localStorage.getItem(outboxKey(user.id)) || "[]");
    if (queued.length === 0 || !navigator.onLine) return;

    const remaining = [];
    for (const item of queued) {
      try {
        await sendChatMessage(item);
      } catch {
        remaining.push(item);
      }
    }
    saveOutbox(remaining);
    if (selectedMemberId) {
      await loadConversation(selectedMemberId);
    }
  }, [loadConversation, saveOutbox, selectedMemberId, user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const savedOutbox = JSON.parse(localStorage.getItem(outboxKey(user.id)) || "[]");
    setOutbox(savedOutbox);

    Promise.all([
      getMembers(),
      getConversationSummaries(user.id).catch(() => []),
    ])
      .then(([data, summaries]) => {
        const visibleMembers = Array.isArray(data)
          ? data.filter((member) => member.id && member.id !== user.id && member.role !== "ACCOUNTANT")
          : [];
        const nextMeta = {};
        if (Array.isArray(summaries)) {
          summaries.forEach((summary) => {
            nextMeta[summary.otherMemberId] = summary;
          });
        }
        setConversationMeta(nextMeta);
        setMembers(visibleMembers);
        if (visibleMembers.length > 0) {
          const firstRecent = [...visibleMembers].sort((a, b) => {
            const aTime = nextMeta[a.id]?.lastMessageAt || "";
            const bTime = nextMeta[b.id]?.lastMessageAt || "";
            if (aTime && bTime && aTime !== bTime) return new Date(bTime) - new Date(aTime);
            if (aTime && !bTime) return -1;
            if (!aTime && bTime) return 1;
            return 0;
          })[0];
          setSelectedMemberId((current) => current || firstRecent.id);
        }
      })
      .catch((err) => console.error("Failed loading chat members:", err));
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return undefined;

    const socket = createChatSocket(user.id);
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      flushOutbox();
    };
    socket.onclose = () => setConnected(false);
    socket.onerror = () => setConnected(false);
    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type !== "MESSAGE" || !payload.message) return;
        const message = payload.message;
        const belongsToOpenConversation =
          selectedMemberId &&
          ((message.senderId === user.id && message.recipientId === selectedMemberId) ||
            (message.senderId === selectedMemberId && message.recipientId === user.id));
        if (belongsToOpenConversation) {
          setMessages((prev) => (
            prev.some((existing) => existing.id === message.id) ? prev : [...prev, message]
          ));
          markConversationRead(user.id, selectedMemberId).catch(() => {});
        }
        updateConversationMetaFromMessage(message);
        if (belongsToOpenConversation) {
          setConversationMeta((prev) => ({
            ...prev,
            [selectedMemberId]: {
              ...(prev[selectedMemberId] || {}),
              unreadCount: 0,
            },
          }));
        }
      } catch (err) {
        console.error("Invalid chat socket message:", err);
      }
    };

    const onlineHandler = () => flushOutbox();
    window.addEventListener("online", onlineHandler);

    return () => {
      window.removeEventListener("online", onlineHandler);
      socket.close();
    };
  }, [flushOutbox, selectedMemberId, updateConversationMetaFromMessage, user?.id]);

  useEffect(() => {
    if (selectedMemberId) {
      loadConversation(selectedMemberId);
    }
  }, [loadConversation, selectedMemberId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || !selectedMemberId || !user?.id) return;

    const payload = {
      senderId: user.id,
      recipientId: selectedMemberId,
      content,
    };

    setDraft("");

    if (connected && socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
      setConversationMeta((prev) => ({
        ...prev,
        [selectedMemberId]: {
          ...(prev[selectedMemberId] || {}),
          lastMessage: content,
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0,
        },
      }));
      return;
    }

    const queuedMessage = {
      ...payload,
      id: `queued-${Date.now()}`,
      sentAt: new Date().toISOString(),
      queued: true,
    };
    saveOutbox([...outbox, payload]);
    setMessages((prev) => [...prev, queuedMessage]);
    updateConversationMetaFromMessage(queuedMessage);
  };

  return (
    <div className="h-[calc(100vh-10rem)] min-h-[560px] bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm flex">
      <aside className="w-80 border-r border-slate-100 bg-slate-50/70 flex flex-col">
        <div className="p-5 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">Community Chat</h2>
            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${connected ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
              {connected ? "Live" : "Offline"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Queued messages send when connection returns.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {sortedMembers.map((member) => {
            const name = `${member.firstName || ""} ${member.lastName || ""}`.trim() || member.email || "Member";
            const meta = conversationMeta[member.id];
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => setSelectedMemberId(member.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${selectedMemberId === member.id ? "bg-white border-secondary shadow-sm" : "bg-transparent border-transparent hover:bg-white"}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-black">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-black text-sm text-slate-900 truncate">{name}</p>
                      {meta?.lastMessageAt && (
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          {new Date(meta.lastMessageAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {meta?.lastMessage || `Flat ${member.flatId || "N/A"}`}
                    </p>
                  </div>
                  {meta?.unreadCount > 0 && (
                    <span className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-secondary text-white text-[10px] font-black flex items-center justify-center">
                      {meta.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="flex-1 flex flex-col min-w-0">
        <header className="h-20 px-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-900">
              {selectedMember
                ? `${selectedMember.firstName || ""} ${selectedMember.lastName || ""}`.trim() || selectedMember.email
                : "Select a member"}
            </h3>
            <p className="text-xs text-slate-500">
              {selectedMember ? `Flat ${selectedMember.flatId || "N/A"}` : "Start a conversation"}
            </p>
          </div>
          {outbox.length > 0 && (
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full">
              {outbox.length} queued
            </span>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5 bg-slate-50/40">
          {loading ? (
            <div className="h-full flex items-center justify-center text-sm font-bold text-slate-400">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm font-bold text-slate-400">No messages yet.</div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const mine = message.senderId === user.id;
                return (
                  <div key={message.id || `${message.sentAt}-${message.content}`} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${mine ? "bg-secondary text-white rounded-br-md" : "bg-white text-slate-900 rounded-bl-md border border-slate-100"}`}>
                      <p className="text-sm font-medium whitespace-pre-wrap break-words">{message.content}</p>
                      <p className={`text-[10px] mt-2 ${mine ? "text-white/70" : "text-slate-400"}`}>
                        {message.queued ? "Queued" : new Date(message.sentAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex items-end gap-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={!selectedMemberId}
            rows={2}
            placeholder={selectedMemberId ? "Type a message..." : "Select a member first"}
            className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!draft.trim() || !selectedMemberId}
            className="h-12 px-6 rounded-xl bg-secondary text-white font-black text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/90 active:scale-95 transition-all"
          >
            Send
          </button>
        </form>
      </section>
    </div>
  );
};

export default MemberChat;
