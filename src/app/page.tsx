import AppLayout from '@/views/layout/AppLayout';
import DashboardView from '@/views/dashboard/DashboardView';

export default function RootHomePage() {
  return (
    <AppLayout>
      <DashboardView />
    </AppLayout>
  );
}
