export default {
  meEndpoint: '/auth/me',
  loginEndpoint: '/auth/login',
  registerEndpoint: '/auth/register-tenant',
  storageTokenKeyName: 'auth_token',
  storageUserKeyName: 'auth_user',
  onTokenExpiration: 'logout' // logout | refreshToken
}
