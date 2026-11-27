// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Dashboard',
      icon: 'tabler:smart-home',
      path: '/dashboard',
      action: 'read',
      subject: 'dashboard'
    },
    {
      sectionTitle: 'Servicio Técnico',
      action: 'read',
      subject: 'tickets'
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
      title: 'IA Servicio Técnico',
      icon: 'tabler:robot',
      path: '/technical-ai',
      action: 'read',
      subject: 'technical-ai'
    },
    {
      sectionTitle: 'Administración',
      action: 'manage',
      subject: 'users'
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

export default navigation
