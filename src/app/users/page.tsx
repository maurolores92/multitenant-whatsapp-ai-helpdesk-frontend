import AppLayout from '@/views/layout/AppLayout';
import UsersView from '@/views/users/UsersView';

export const metadata = {
  title: 'Gestión de Usuarios | WhatsApp Multi-Tenant CRM',
  description: 'Administración de usuarios, asignación de roles y control de credenciales',
};

export default function UsersPage() {
  return (
    <AppLayout>
      <UsersView />
    </AppLayout>
  );
}
