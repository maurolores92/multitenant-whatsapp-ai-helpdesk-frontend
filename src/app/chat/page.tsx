import AppLayout from '@/views/layout/AppLayout';
import ChatView from '@/views/chat/ChatView';

export const metadata = {
  title: 'WhatsApp Chat | WhatsApp Multi-Tenant CRM',
  description: 'Bandeja compartida de WhatsApp con firma de operadores y triaje IA',
};

export default function ChatPage() {
  return (
    <AppLayout>
      <ChatView />
    </AppLayout>
  );
}
