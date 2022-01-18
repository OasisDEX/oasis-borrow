import { Box, Card, Heading, Text } from 'theme-ui'
import { staticFilesRuntimeUrl } from '../helpers/staticPaths'
import { AppLink } from './Links'
import getConfig from 'next/config'

const {
  publicRuntimeConfig: { apiHost },
} = getConfig()

const ROUTES = {
  ASSETS: '/assets/all',
  ASSET: (token: string) => `/assets/${token}`,
  CONTACT: `${apiHost}/daiwallet/contact`,
  SUPPORT: '/support',
  TWITTER: 'https://twitter.com/oasisdotapp',
  DISCORD: 'https://discord.gg/Kc2bBB59GC',
}

const GRADIENTS = {
  howItWorksBullet: 'linear-gradient(137.02deg, #2A30EE 0%, #A4A6FF 99.12%)',
  haveSomeQuestionsLearn:
    'radial-gradient(108.93% 164.65% at 2.92% 94.16%,#FFDDF1 0%,#EEF0FF 47.4%,#DDFFF7 100%)',
  haveSomeQuestionsSupport:
    'radial-gradient(139.72% 401.11% at 11.11% -167.78%,#FFFADD 34%,#E9FFEB 56.96%,#FADDFF 90%)',
  getStartedMultiply: 'linear-gradient(127.5deg, #EEE1F9 0%, #FFECE8 56.77%, #DDFFF7 100%)',
  getStartedBorrow: 'linear-gradient(127.5deg, #E4F9C9 0%, #E8FFF5 49.48%, #F9E1EB 100%)',
  getStartedManage: 'linear-gradient(127.5deg, #DDFFF7 0%, #E8EAFF 61.98%, #F9E1EF 100%)',
}

export function InfoCard({
  title,
  subtitle,
  links,
  backgroundImage,
  backgroundGradient,
}: {
  title: string
  subtitle: string
  links: Array<{ href: string; text: string }>
  backgroundImage: string
  backgroundGradient: string
}) {
  return (
    <Card
      sx={{
        p: 4,
        minHeight: '411px',
        borderRadius: 'large',
        border: 'none',
        backgroundImage: `url(${staticFilesRuntimeUrl(backgroundImage)}), ${backgroundGradient}`,
        backgroundPosition: 'bottom 0px right 0px',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Heading sx={{ my: 2, fontWeight: 'bold', color: 'primary' }}>{title}</Heading>
        <Text sx={{ mb: 3, color: 'text.subtitle', minHeight: '3em' }}>{subtitle}</Text>
        {links.map(({ href, text }, i) => (
          <>
            <AppLink
              key={i}
              href={href}
              sx={{ pb: 3, fontSize: '16px', color: 'primary', display: 'block' }}
            >
              {text} ->
            </AppLink>
          </>
        ))}
      </Box>
    </Card>
  )
}
