import { Box, Card, Heading, Text, SxStyleProp } from 'theme-ui'
import { staticFilesRuntimeUrl } from '../helpers/staticPaths'
import { AppLink } from './Links'
import getConfig from 'next/config'

export function InfoCard({
  title,
  subtitle,
  links,
  backgroundImage,
  backgroundGradient,
  sx,
}: {
  title: string
  subtitle: string
  links: Array<{ href: string; text: string }>
  backgroundImage: string
  backgroundGradient: string
  sx?: SxStyleProp
}) {
  return (
    <Card
      sx={{
        ...sx,
        p: 4,
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
