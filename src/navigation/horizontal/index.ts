// ** Type import
import { HorizontalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): HorizontalNavItemsType => {
  return [
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
