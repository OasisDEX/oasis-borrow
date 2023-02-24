import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button, Card, Flex, Heading, Image, Text } from 'theme-ui'

interface AjnaRewardCardProps {
  title: string
  image: string
  list: string[]
  link: { title: string; href: string }
  banner: {
    title: string
    value: string
    subValue: string
    button: { title: string }
    footer?: string
  }
  gradient: string
}

export function AjnaRewardCard({
  title,
  image,
  list,
  link,
  banner,
  gradient,
}: AjnaRewardCardProps) {
  const { t } = useTranslation()

  return (
    <Card p={4} sx={{ height: '100%' }}>
      <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
        <Flex
          sx={{
            width: '100px',
            height: '100px',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '50%',
            background: gradient,
            mb: [3, '21px'],
          }}
        >
          <Image src={staticFilesRuntimeUrl(image)} />
        </Flex>
        <Heading
          sx={{
            fontSize: [3, 5],
            mb: 3,
            fontWeight: ['regular', 'semiBold'],
            color: ['neutral80', 'primary100'],
          }}
        >
          {t(title)}
        </Heading>
        <Box
          as="ul"
          sx={{
            flexDirection: 'column',
            p: 0,
            mb: 3,
            listStylePosition: 'inside',
            display: ['none', 'flex'],
          }}
        >
          {list.map((item) => (
            <Box
              as="li"
              key={item}
              sx={{
                alignItems: 'flex-start',
                display: 'list-item',
                color: 'neutral80',
                wordWrap: 'break-word',
              }}
            >
              <Text as="span" variant="paragraph3" color="inherit">
                {t(item)}
              </Text>
            </Box>
          ))}
        </Box>
        <AppLink href={link.href} sx={{ display: ['none', 'block'] }}>
          <WithArrow gap={1} sx={{ color: 'inherit' }}>
            {t(link.title)}
          </WithArrow>
        </AppLink>
        <Card
          sx={{
            background: ['unset', gradient],
            p: 4,
            pb: [4, '22px'],
            mt: [0, '22px'],
            pt: [0, 4],
            border: 'none',
            width: '100%',
          }}
        >
          <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
            <Heading sx={{ fontSize: 2, mb: 2, display: ['none', 'block'] }}>
              {t(banner.title)}
            </Heading>
            <Text as="p" sx={{ fontSize: '28px', fontWeight: 'medium' }}>
              {banner.value}
            </Text>
            <Text as="p" variant="paragraph2" sx={{ color: 'neutral80', mb: [4, '21px'] }}>
              {banner.subValue}
            </Text>
            <Button sx={{ mb: [0, '19px'], fontSize: 1, pl: '24px', pr: 4 }}>
              <WithArrow gap={1} sx={{ color: 'inherit' }}>
                {t(banner.button.title)}
              </WithArrow>
            </Button>
            {banner.footer && (
              <Text
                as="p"
                variant="paragraph3"
                sx={{ color: 'neutral80', display: ['none', 'block'] }}
              >
                {t(banner.footer)}
              </Text>
            )}
          </Flex>
        </Card>
        <AppLink href={link.href} sx={{ display: ['block', 'none'], fontWeight: 'regular' }}>
          <WithArrow gap={1} sx={{ color: 'inherit' }}>
            {t(link.title)}
          </WithArrow>
        </AppLink>
      </Flex>
    </Card>
  )
}
