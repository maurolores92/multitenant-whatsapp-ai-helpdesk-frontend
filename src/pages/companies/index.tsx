import CompaniesView from 'src/views/apps/companies/CompaniesView'

const CompaniesPage = () => {
  return <CompaniesView />
}

CompaniesPage.acl = {
  action: 'manage',
  subject: 'companies'
}

export default CompaniesPage
