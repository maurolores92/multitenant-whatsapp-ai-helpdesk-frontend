import DashboardView from 'src/views/dashboard/DashboardView'

const DashboardPage = () => {
  return <DashboardView />
}

DashboardPage.acl = {
  action: 'read',
  subject: 'dashboard'
}

export default DashboardPage
