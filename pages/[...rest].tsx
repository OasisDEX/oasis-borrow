import NotFound from 'pages/not-found'

export const getServerSideProps: () => Promise<unknown> = async () => {
  return { redirect: { destination: '/not-found', permanent: true } }
}

export default NotFound
