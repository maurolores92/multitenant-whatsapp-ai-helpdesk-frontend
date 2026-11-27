import TicketsView from 'src/views/apps/tickets/TicketsView'

const TicketsPage = () => {
  return <TicketsView />
}

TicketsPage.acl = {
  action: 'read',
  subject: 'tickets'
}

export default TicketsPage
