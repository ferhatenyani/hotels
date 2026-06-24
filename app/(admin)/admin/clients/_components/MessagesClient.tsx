"use client";

import { ExternalLink, Mail, MessageCircle, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AvatarChip, Avatar } from "@/components/admin/AvatarChip";
import { Badge } from "@/components/admin/Badge";
import { Button } from "@/components/admin/Button";
import { Card, CardBody, CardHeader } from "@/components/admin/Card";
import { EmptyState } from "@/components/admin/EmptyState";
import { Field, Select, Textarea } from "@/components/admin/form";
import { PageHeader } from "@/components/admin/PageHeader";
import { Sheet } from "@/components/admin/Sheet";
import { useToast } from "@/components/admin/Toast";
import { FilterChip, Toolbar } from "@/components/admin/Toolbar";

import { cn } from "@/lib/utils";

import { currentSession } from "@/lib/admin/auth";
import { fmtDateTime, fmtName, fmtRelative, fmtTime } from "@/lib/admin/format";
import { repo } from "@/lib/admin/repo";
import { subscribe } from "@/lib/admin/store";
import {
  messageChannelLabels,
  type Guest,
  type Message,
  type MessageChannel,
} from "@/lib/admin/types";

type ChannelFilter = MessageChannel | "all";

type ThreadSummary = {
  threadId: string;
  guestId: string;
  guest?: Guest;
  last: Message;
  messages: Message[];
  unread: boolean;
  unreadCount: number;
};

export function MessagesClient({
  initialGuestId,
  initialThreadId,
}: {
  initialGuestId?: string;
  initialThreadId?: string;
}) {
  const toast = useToast();
  const [tick, setTick] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
    initialThreadId ?? null,
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Toolbar state
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);

  // Composer state
  const [draft, setDraft] = useState("");
  const [draftChannel, setDraftChannel] = useState<MessageChannel>("email");
  const [sending, setSending] = useState(false);

  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);

  // Suivi du breakpoint lg (1024 px) pour décider si la conversation
  // s'ouvre en panneau inline (desktop) ou en Sheet plein écran (mobile/tablette).
  // Synchronise un état React avec une source externe (matchMedia) — la
  // règle « set-state-in-effect » est ici un faux positif, c'est le cas
  // d'usage explicitement validé dans la doc React 19.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDesktop(mq.matches);
    // Si un thread est passé en query string sur mobile, on ouvre la Sheet.
    if (!mq.matches && initialThreadId) setSheetOpen(true);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [initialThreadId]);

  useEffect(() => {
    void Promise.all([repo.messages.list(), repo.guests.list()]).then(
      ([m, g]) => {
        setMessages(m);
        setGuests(g);
        setLoading(false);
      },
    );
  }, [tick]);

  const guestById = (id: string) => guests.find((g) => g.id === id);

  // Compute threads (group messages by threadId)
  const threads = useMemo<ThreadSummary[]>(() => {
    const byThread = new Map<string, Message[]>();
    for (const m of messages) {
      const list = byThread.get(m.threadId) ?? [];
      list.push(m);
      byThread.set(m.threadId, list);
    }
    const result: ThreadSummary[] = [];
    for (const [threadId, list] of byThread.entries()) {
      const sorted = [...list].sort((a, b) => a.sentAt.localeCompare(b.sentAt));
      const last = sorted[sorted.length - 1];
      const unreadCount = sorted.filter(
        (m) => m.direction === "inbound" && !m.readAt,
      ).length;
      result.push({
        threadId,
        guestId: last.guestId,
        guest: guestById(last.guestId),
        last,
        messages: sorted,
        unread: unreadCount > 0,
        unreadCount,
      });
    }
    return result.sort((a, b) => b.last.sentAt.localeCompare(a.last.sentAt));
  }, [messages, guests]); // eslint-disable-line react-hooks/exhaustive-deps

  // Find a thread for the initial guest if no threadId was provided
  useEffect(() => {
    if (selectedThreadId || !initialGuestId || threads.length === 0) return;
    const guestThread = threads.find((t) => t.guestId === initialGuestId);
    if (guestThread) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedThreadId(guestThread.threadId);
      if (!isDesktop) setSheetOpen(true);
    }
  }, [initialGuestId, selectedThreadId, threads, isDesktop]);

  const filteredThreads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return threads.filter((t) => {
      if (q) {
        const name = `${t.guest?.firstName ?? ""} ${t.guest?.lastName ?? ""}`.toLowerCase();
        if (!name.includes(q)) return false;
      }
      if (channelFilter !== "all" && t.last.channel !== channelFilter) return false;
      if (unreadOnly && !t.unread) return false;
      return true;
    });
  }, [threads, search, channelFilter, unreadOnly]);

  const selected = useMemo(
    () => threads.find((t) => t.threadId === selectedThreadId),
    [threads, selectedThreadId],
  );

  // Mark inbound messages of selected thread as read once when opened
  useEffect(() => {
    if (!selected) return;
    const unread = selected.messages.filter(
      (m) => m.direction === "inbound" && !m.readAt,
    );
    if (unread.length === 0) return;
    void Promise.all(unread.map((m) => repo.messages.markRead(m.id)));
  }, [selected?.threadId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset draft channel based on last message of selected thread
  useEffect(() => {
    if (!selected) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraftChannel(selected.last.channel);
  }, [selected?.threadId]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectThread = (threadId: string) => {
    setSelectedThreadId(threadId);
    if (!isDesktop) setSheetOpen(true);
  };

  const onSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selected) return;
    const session = currentSession();
    if (!draft.trim()) {
      toast.push({
        tone: "warn",
        title: "Message vide",
        body: "Saisissez le texte avant l'envoi.",
      });
      return;
    }
    if (!session) {
      toast.push({
        tone: "danger",
        title: "Session expirée",
        body: "Reconnectez-vous pour envoyer un message.",
      });
      return;
    }
    setSending(true);
    try {
      await repo.messages.send({
        guestId: selected.guestId,
        channel: draftChannel,
        threadId: selected.threadId,
        body: draft.trim(),
        subject: selected.last.subject ? `Re: ${selected.last.subject}` : undefined,
        sentBy: session.staffId,
      });
      setDraft("");
      toast.push({
        tone: "ok",
        title: "Message envoyé",
        body: `Acheminé via ${messageChannelLabels[draftChannel].toLowerCase()}.`,
      });
    } catch {
      toast.push({
        tone: "danger",
        title: "Erreur",
        body: "Impossible d'envoyer le message.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Clients", href: "/admin/clients" },
          { label: "Messagerie" },
        ]}
        title="Messagerie clients"
        subtitle={
          "E-mail, SMS et messagerie interne — toutes les conversations en un seul endroit."
        }
      />

      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher un client…"
        filters={
          <>
            <span className="inline-flex items-center gap-1.5 pr-1 text-[11.5px] text-[var(--color-admin-muted)]">
              <MessageCircle className="size-3.5" aria-hidden />
              Canal
            </span>
            {(["email", "sms", "in-app"] as MessageChannel[]).map((c) => (
              <FilterChip
                key={c}
                label={messageChannelLabels[c]}
                active={channelFilter === c}
                onClick={() =>
                  setChannelFilter((curr) => (curr === c ? "all" : c))
                }
                onClear={() => setChannelFilter("all")}
              />
            ))}
            <span className="mx-1 inline-block h-4 w-px bg-[var(--color-admin-divider)]" />
            <FilterChip
              label="Non lus"
              active={unreadOnly}
              onClick={() => setUnreadOnly((u) => !u)}
              onClear={() => setUnreadOnly(false)}
            />
          </>
        }
      />

      {loading ? (
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
              <div className="space-y-2 animate-pulse">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-md bg-[var(--color-admin-sunken)]" />
                ))}
              </div>
              <div className="hidden lg:block h-[460px] rounded-md bg-[var(--color-admin-sunken)] animate-pulse" />
            </div>
          </CardBody>
        </Card>
      ) : threads.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Mail className="size-5" />}
            title="Aucune conversation pour le moment"
            body={"Les échanges avec les clients (e-mail, SMS, in-app) s'afficheront ici dès qu'une conversation existera."}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] min-h-[560px]">
            {/* Sidebar threads */}
            <aside className="border-b lg:border-b-0 lg:border-r border-[var(--color-admin-divider)] bg-[var(--color-admin-panel)]">
              <ThreadsSidebar
                threads={filteredThreads}
                selectedThreadId={selectedThreadId}
                onSelect={selectThread}
              />
            </aside>

            {/* Desktop thread view */}
            <section className="hidden lg:flex flex-col min-w-0">
              {selected ? (
                <ThreadView
                  thread={selected}
                  draft={draft}
                  onDraftChange={setDraft}
                  draftChannel={draftChannel}
                  onDraftChannelChange={setDraftChannel}
                  sending={sending}
                  onSend={onSend}
                />
              ) : (
                <div className="flex flex-1 items-center justify-center p-8">
                  <EmptyState
                    icon={<MessageCircle className="size-5" />}
                    title="Sélectionnez une conversation"
                    body={"Choisissez un fil à gauche pour afficher l'historique et répondre."}
                  />
                </div>
              )}
            </section>
          </div>
        </Card>
      )}

      {/* Mobile / tablet sheet for selected thread */}
      <Sheet
        open={sheetOpen && !isDesktop && !!selected}
        onClose={() => setSheetOpen(false)}
        width="lg"
        title={
          selected?.guest
            ? fmtName(selected.guest.firstName, selected.guest.lastName)
            : "Conversation"
        }
        description={
          selected ? messageChannelLabels[selected.last.channel] : undefined
        }
      >
        {selected ? (
          <ThreadView
            thread={selected}
            draft={draft}
            onDraftChange={setDraft}
            draftChannel={draftChannel}
            onDraftChannelChange={setDraftChannel}
            sending={sending}
            onSend={onSend}
            embedded
          />
        ) : null}
      </Sheet>
    </>
  );
}

// ─── Threads sidebar ───────────────────────────────────────────────────

function ThreadsSidebar({
  threads,
  selectedThreadId,
  onSelect,
}: {
  threads: ThreadSummary[];
  selectedThreadId: string | null;
  onSelect: (threadId: string) => void;
}) {
  if (threads.length === 0) {
    return (
      <EmptyState
        title="Aucun résultat"
        body={"Aucune conversation ne correspond à vos filtres."}
      />
    );
  }

  return (
    <ul className="divide-y divide-[var(--color-admin-divider)] max-h-[640px] overflow-y-auto scroll-dark">
      {threads.map((t) => {
        const isActive = selectedThreadId === t.threadId;
        return (
          <li key={t.threadId}>
            <button
              type="button"
              onClick={() => onSelect(t.threadId)}
              className={cn(
                "flex w-full items-start gap-3 px-3.5 py-3 text-left transition-colors",
                isActive
                  ? "bg-[var(--color-admin-sunken)]"
                  : "hover:bg-[var(--color-admin-sunken)]/60",
              )}
              aria-current={isActive ? "true" : undefined}
            >
              <Avatar
                firstName={t.guest?.firstName}
                lastName={t.guest?.lastName}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="truncate text-[13px] font-medium text-[var(--color-admin-text)]">
                    {fmtName(t.guest?.firstName, t.guest?.lastName)}
                  </span>
                  <span className="ml-auto shrink-0 text-[11px] tnum text-[var(--color-admin-faint)]">
                    {fmtRelative(t.last.sentAt)}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <Badge tone="muted" small>
                    {messageChannelLabels[t.last.channel]}
                  </Badge>
                  {t.unread ? (
                    <span
                      className="status-dot bg-[var(--color-admin-info-fg)]"
                      aria-label={`${t.unreadCount} message${t.unreadCount > 1 ? "s" : ""} non lu${t.unreadCount > 1 ? "s" : ""}`}
                    />
                  ) : null}
                </div>
                <p
                  className={cn(
                    "mt-1 line-clamp-2 text-[12.5px] leading-[16px]",
                    t.unread
                      ? "text-[var(--color-admin-text)] font-medium"
                      : "text-[var(--color-admin-muted)]",
                  )}
                >
                  {t.last.subject ? <span className="font-medium">{t.last.subject} · </span> : null}
                  {t.last.body}
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// ─── Thread view ───────────────────────────────────────────────────────

function ThreadView({
  thread,
  draft,
  onDraftChange,
  draftChannel,
  onDraftChannelChange,
  sending,
  onSend,
  embedded,
}: {
  thread: ThreadSummary;
  draft: string;
  onDraftChange: (s: string) => void;
  draftChannel: MessageChannel;
  onDraftChannelChange: (c: MessageChannel) => void;
  sending: boolean;
  onSend: (e?: React.FormEvent) => void;
  embedded?: boolean;
}) {
  return (
    <div className={cn("flex flex-col min-w-0", embedded ? "min-h-[560px]" : "h-full")}>
      <CardHeader
        title={
          <span className="inline-flex items-center gap-2">
            <AvatarChip
              firstName={thread.guest?.firstName}
              lastName={thread.guest?.lastName}
              subtitle={thread.guest?.email}
            />
          </span>
        }
        subtitle={
          <span className="inline-flex items-center gap-1.5">
            <Badge tone="muted" small>
              {messageChannelLabels[thread.last.channel]}
            </Badge>
            <span className="tnum">
              {thread.messages.length} message{thread.messages.length > 1 ? "s" : ""}
            </span>
          </span>
        }
        actions={
          thread.guest ? (
            <Button
              variant="ghost"
              size="sm"
              href={`/admin/clients/${thread.guest.id}`}
              rightIcon={<ExternalLink className="size-3.5" />}
            >
              Voir profil
            </Button>
          ) : null
        }
        className="shrink-0"
      />

      <div className="flex-1 overflow-y-auto scroll-dark px-5 py-4 space-y-3">
        {thread.messages.map((m, idx) => {
          const sameAsPrev = idx > 0 && thread.messages[idx - 1].direction === m.direction;
          return (
            <MessageBubble
              key={m.id}
              message={m}
              guest={thread.guest}
              groupedWithPrev={sameAsPrev}
            />
          );
        })}
      </div>

      <form
        onSubmit={onSend}
        className="shrink-0 border-t border-[var(--color-admin-divider)] bg-[var(--color-admin-sunken)]/40 p-3 space-y-2"
        noValidate
      >
        <div className="flex items-center gap-2">
          <Field className="flex-1 mb-0">
            <Textarea
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              rows={2}
              placeholder="Tapez votre message…"
              className="bg-[var(--color-admin-panel)]"
            />
          </Field>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11.5px] uppercase tracking-[0.06em] text-[var(--color-admin-muted)]">
              Canal
            </span>
            <Select
              value={draftChannel}
              onChange={(e) => onDraftChannelChange(e.target.value as MessageChannel)}
              aria-label="Canal d'envoi"
              className="h-8 text-[12.5px]"
            >
              {(["email", "sms", "in-app"] as MessageChannel[]).map((c) => (
                <option key={c} value={c}>
                  {messageChannelLabels[c]}
                </option>
              ))}
            </Select>
          </div>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            loading={sending}
            loadingLabel={"Envoi …"}
            leftIcon={<Send className="size-4" />}
          >
            Envoyer
          </Button>
        </div>
      </form>
    </div>
  );
}

function MessageBubble({
  message,
  guest,
  groupedWithPrev,
}: {
  message: Message;
  guest?: Guest;
  groupedWithPrev?: boolean;
}) {
  const isInbound = message.direction === "inbound";
  return (
    <div
      className={cn(
        "flex gap-2 items-end",
        isInbound ? "justify-start" : "justify-end",
        groupedWithPrev ? "mt-1" : "mt-3",
      )}
    >
      {isInbound && !groupedWithPrev ? (
        <Avatar
          firstName={guest?.firstName}
          lastName={guest?.lastName}
          size="sm"
          className="shrink-0"
        />
      ) : isInbound ? (
        <span aria-hidden className="size-7 shrink-0" />
      ) : null}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2 ring-1 shadow-sm",
          isInbound
            ? "bg-[var(--color-admin-sunken)] ring-[var(--color-admin-border)] text-[var(--color-admin-text)] rounded-bl-md"
            : "bg-marine text-white ring-transparent rounded-br-md",
        )}
      >
        {message.subject ? (
          <p
            className={cn(
              "text-[11.5px] font-medium mb-1",
              isInbound ? "text-[var(--color-admin-muted)]" : "text-white/80",
            )}
          >
            {message.subject}
          </p>
        ) : null}
        <p className="whitespace-pre-wrap text-[13.5px] leading-5">{message.body}</p>
        <p
          className={cn(
            "mt-1 text-[10.5px] tnum",
            isInbound ? "text-[var(--color-admin-faint)]" : "text-white/65",
          )}
          title={fmtDateTime(message.sentAt)}
        >
          {fmtTime(message.sentAt)}
        </p>
      </div>
    </div>
  );
}
