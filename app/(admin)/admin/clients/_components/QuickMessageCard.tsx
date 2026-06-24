"use client";

import { Send } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/admin/Button";
import { Card, CardBody, CardHeader } from "@/components/admin/Card";
import { Field, Input, RadioGroup, Textarea } from "@/components/admin/form";
import { useToast } from "@/components/admin/Toast";

import { currentSession } from "@/lib/admin/auth";
import { repo } from "@/lib/admin/repo";
import {
  messageChannelLabels,
  type Guest,
  type MessageChannel,
} from "@/lib/admin/types";

export function QuickMessageCard({ guest }: { guest: Guest }) {
  const toast = useToast();
  const [channel, setChannel] = useState<MessageChannel>("email");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const onSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const session = currentSession();
    if (!body.trim()) {
      toast.push({
        tone: "warn",
        title: "Message vide",
        body: "Saisissez le texte du message avant l'envoi.",
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
        guestId: guest.id,
        channel,
        subject: channel === "email" && subject.trim() ? subject.trim() : undefined,
        body: body.trim(),
        sentBy: session.staffId,
      });
      toast.push({
        tone: "ok",
        title: "Message envoyé",
        body: `Acheminé via ${messageChannelLabels[channel].toLowerCase()}.`,
      });
      setSubject("");
      setBody("");
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
    <Card>
      <CardHeader title="Envoyer un message" subtitle="Réponse rapide depuis le profil" />
      <CardBody>
        <form onSubmit={onSend} className="space-y-3" noValidate>
          <Field label="Canal">
            <RadioGroup
              name="qmsg-channel"
              value={channel}
              onChange={(v) => setChannel(v)}
              options={(["email", "sms", "in-app"] as MessageChannel[]).map((c) => ({
                value: c,
                label: messageChannelLabels[c],
              }))}
            />
          </Field>
          {channel === "email" ? (
            <Field label="Objet" htmlFor="qmsg-subject">
              <Input
                id="qmsg-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Objet du message"
              />
            </Field>
          ) : null}
          <Field label="Message" required htmlFor="qmsg-body">
            <Textarea
              id="qmsg-body"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Bonjour, votre chambre est prête…"
            />
          </Field>
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            type="submit"
            loading={sending}
            loadingLabel={"Envoi …"}
            leftIcon={<Send className="size-4" />}
          >
            Envoyer
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
