"use client";

import { use } from "react";
import { ChatWindow } from "@/components/shared/chat-window";
import { PageHeader } from "@/components/shared/page-header";
import { mockConversations, mockMessages } from "@/lib/mocks/data";

export default function AppointmentChatPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = use(params);

  return (
    <div className="space-y-6">
      <PageHeader title={`Appointment Chat ${appointmentId}`} subtitle="Conversation stream scoped to selected visit" />
      <ChatWindow
        conversations={mockConversations.filter((item) => item.appointmentId === appointmentId)}
        messages={mockMessages}
      />
    </div>
  );
}
