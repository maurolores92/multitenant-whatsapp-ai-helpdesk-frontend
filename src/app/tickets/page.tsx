import AppLayout from '@/views/layout/AppLayout';
import TicketsView from '@/views/tickets/TicketsView';

export const metadata = {
  title: 'Tickets & Órdenes de Servicio | WhatsApp Multi-Tenant CRM',
  description: 'Casos e incidencias derivados por el Bot de IA y atención técnica',
};

export default function TicketsPage() {
  return (
    <AppLayout>
      <TicketsView />
    </AppLayout>
  );
}
