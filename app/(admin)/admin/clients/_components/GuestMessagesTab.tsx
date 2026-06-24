"use client";

import { MessageSquare, Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/admin/Badge";
import { Button } from "@/components/admin/Button";
import { Card, CardBody } from "@/components/admin/Card";
import { EmptyState } from "@/components/admin/EmptyState";

import { fmtRelative } from "@/lib/admin/format";
import { repo } from "@/lib/admin/repo";
import { subscribe } from "@/lib/admin/store";
import {
  messageChannelLabels,
  type Guest,
  type Message,
} from "@/lib/admin/types";

export function GuestMessagesTab({ guest }: { guest: Guest }) {
  const [tick, setTick] = useState(0);
  const [messages, setMessages] = useState<Message[] | undefined>(undefined);

  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);

  useEffect(() => {
    let cancelled = false;
    void repo.messages.threadsForGuest(guest.id).then((m) => {
      if (cancelled) return;
      setMessages(m);
    });
    return () => {
      cancelled = true;
    };
  }, [guest.id, tick]);

  const threads = useMemo(() => {
    if (!messages) return [];
    const byThread = new Map<string, Message[]>();
    for (const m of messages) {
      const list = byThread.get(m.threadId) ?? [];
      list.push(m);
      byThread.set(m.threadId, list);
    }
    return Array.from(byThread.entries())
      .map(([threadId, list]) => {
        const sorted = [...list].sort((a, b) => a.sentAt.localeCompare(b.sentAt));
        return {
          threadId,
          last: sorted[sorted.length - 1],
          count: sorted.length,
          unread: sorted.some((m) => m.direction === "inbound" && !m.readAt),
        };
      })
      .sort((a, b) => b.last.sentAt.localeCompare(a.last.sentAt));
  }, [messages]);

  if (messages === undefined) {
    return (
      <div className="space-y-2 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-14 rounded-md bg-[var(--color-admin-sunken)]" />
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="size-5" />}
        title="Aucune conversation"
        body={"Aucun échange avec ce client pour le moment."}
        action={
          <Button
            variant="primary"
            size="sm"
            href={`/admin/clients/messages?guest=${guest.id}`}
            leftIcon={<Send className="size-4" />}
          >
            Envoyer un message
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12.5px] text-[var(--color-admin-muted)]">
          {threads.length} conversation{threads.length > 1 ? "s" : ""} ·{" "}
          {messages.length} message{messages.length > 1 ? "s" : ""} au total.
        </p>
        <Button
          variant="secondary"
          size="sm"
          href={`/admin/clients/messages?guest=${guest.id}`}
          leftIcon={<MessageSquare className="size-4" />}
        >
          Ouvrir la messagerie
        </Button>
      </div>

      <ul className="space-y-2">
        {threads.map((t) => (
          <li key={t.threadId}>
            <Link
              href={`/admin/clients/messages?guest=${guest.id}&thread=${t.threadId}`}
              className="block"
            >
              <Card className="ring-0 shadow-none border border-[var(--color-admin-border)] hover:bg-[var(--color-admin-sunken)]/60 transition-colors">
                <CardBody className="flex items-start gap-3">
                  <span
                    className={
                      t.unread
                        ? "mt-1.5 status-dot bg-[var(--color-admin-info-fg)] shrink-0"
                        : "mt-1.5 status-dot bg-transparent shrink-0"
                    }
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge tone="muted" small>
                        {messageChannelLabels[t.last.channel]}
                      </Badge>
                      {t.last.subject ? (
                        <span className="truncate text-[13px] font-medium text-[var(--color-admin-text)]">
                          {t.last.subject}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[12.5px] text-[var(--color-admin-muted)] line-clamp-2">
                      {t.last.body}
                    </p>
                  </div>
                  <span className="shrink-0 tnum text-[11.5px] text-[var(--color-admin-faint)]">
                    {fmtRelative(t.last.sentAt)}
                  </span>
                </CardBody>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
