import UsersView from 'src/views/apps/users/UsersView'

const UsersPage = () => {
  return <UsersView />
}

UsersPage.acl = {
  action: 'manage',
  subject: 'users'
}

export default UsersPage
