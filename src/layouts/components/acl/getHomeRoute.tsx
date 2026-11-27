/**
 *  Set Home URL based on User Roles
 */
const getHomeRoute = (role: string) => {
  if (role === 'SUPER_ADMIN') return '/companies'

  return '/dashboard'
}

export default getHomeRoute
