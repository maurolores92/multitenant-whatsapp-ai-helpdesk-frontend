import WhatsAppChatView from 'src/views/apps/whatsapp-chat/WhatsAppChatView'

const ChatPage = () => {
  return <WhatsAppChatView />
}

ChatPage.contentHeightFixed = true

ChatPage.acl = {
  action: 'read',
  subject: 'chat'
}

export default ChatPage
