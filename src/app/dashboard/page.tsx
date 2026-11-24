import AppLayout from '@/views/layout/AppLayout';
import DashboardView from '@/views/dashboard/DashboardView';

export const metadata = {
  title: 'Dashboard | WhatsApp Multi-Tenant CRM',
  description: 'Panel general de soporte técnico con IA y WhatsApp',
};

export default function DashboardPage() {
  return (
    <AppLayout>
      <DashboardView />
    </AppLayout>
  );
}
