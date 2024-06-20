import { INTERNAL_LINKS } from 'helpers/applicationLinks'

export const handleRaysRedirect = () => {
  // hard redirect required since /rays is different app
  const target = `${window.location.origin}${INTERNAL_LINKS.rays}`
  window.history.pushState({}, '', target)
  window.location.assign(target)
}
