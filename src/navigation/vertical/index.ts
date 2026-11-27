// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      sectionTitle: 'Operaciones & Soporte',
      action: 'read',
      subject: 'dashboard'
    },
    {
      title: 'Dashboard',
      icon: 'tabler:smart-home',
      path: '/dashboard',
      action: 'read',
      subject: 'dashboard'
    },
    {
      title: 'WhatsApp Chat',
      icon: 'tabler:brand-whatsapp',
      path: '/chat',
      action: 'read',
      subject: 'chat'
    },
    {
      title: 'Tickets & IA',
      icon: 'tabler:ticket',
      path: '/tickets',
      action: 'read',
      subject: 'tickets'
    },
    {
      sectionTitle: 'Administración',
      action: 'manage',
      subject: 'users'
    },
    {
      title: 'Compañías',
      icon: 'tabler:building',
      path: '/companies',
      action: 'manage',
      subject: 'companies'
    },
    {
      title: 'Usuarios',
      icon: 'tabler:users',
      path: '/users',
      action: 'manage',
      subject: 'users'
    }
  ]
}

export default navigation
