import TechnicalAiView from 'src/views/apps/technical-ai/TechnicalAiView'

const TechnicalAiPage = () => {
  return <TechnicalAiView />
}

TechnicalAiPage.acl = {
  action: 'read',
  subject: 'technical-ai'
}

export default TechnicalAiPage
