"use client";

import { ChatWindow } from "@/components/shared/chat-window";
import { ErrorState } from "@/components/shared/error-state";
import { LoadState } from "@/components/shared/load-state";
import { PageHeader } from "@/components/shared/page-header";
import { useConversations } from "@/hooks/use-app-data";
import { mockMessages } from "@/lib/mocks/data";

export default function ChatPage() {
  const conversations = useConversations();

  return (
    <div className="space-y-6">
      <PageHeader title="Chat" subtitle="Care communication with appointment context" />
      {conversations.isLoading ? <LoadState /> : null}
      {conversations.isError ? <ErrorState /> : null}
      {conversations.data ? (
        <ChatWindow conversations={conversations.data} messages={mockMessages} />
      ) : null}
    </div>
  );
}
