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
      title: 'Chats de IA',
      icon: 'tabler:brand-whatsapp',
      path: '/chat',
      action: 'read',
      subject: 'chat'
    },
    {
      title: 'Tickets',
      icon: 'tabler:ticket',
      path: '/tickets',
      action: 'read',
      subject: 'tickets'
    },
    {
      title: 'Configuración',
      icon: 'tabler:settings',
      children: [
        {
          title: 'IA Servicio Técnico',
          icon: 'tabler:robot',
          path: '/technical-ai',
          action: 'read',
          subject: 'technical-ai'
        },
        {
          title: 'Empresa & Agentes',
          icon: 'tabler:building',
          path: '/companies',
          action: 'manage',
          subject: 'companies'
        },
        {
          title: 'Usuarios y Permisos',
          icon: 'tabler:users',
          path: '/users',
          action: 'manage',
          subject: 'users'
        }
      ]
    }
  ]
}

export default navigation
