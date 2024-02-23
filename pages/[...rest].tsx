import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import NotFound from 'pages/not-found'

export const getServerSideProps: () => Promise<unknown> = async () => {
  return { redirect: { destination: INTERNAL_LINKS.notFound, permanent: true } }
}

export default NotFound
