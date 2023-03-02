import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { getAjnaWithArrowColorScheme } from 'features/ajna/common/helpers/getAjnaWithArrowColorScheme'
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
    <Card p={4} sx={{ height: '100%', borderRadius: 'large' }}>
      <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
        <Flex
          sx={{
            width: '100px',
            height: '100px',
            justifyContent: 'center',
            alignItems: 'center',
            mb: [3, '24px'],
            borderRadius: 'ellipse',
            background: gradient,
          }}
        >
          <Image src={staticFilesRuntimeUrl(image)} />
        </Flex>
        <Heading
          sx={{
            mb: 3,
            fontSize: [3, 5],
            fontWeight: ['regular', 'semiBold'],
            color: ['neutral80', 'primary100'],
          }}
        >
          {t(title)}
        </Heading>
        <Box
          as="ul"
          sx={{
            display: ['none', 'flex'],
            flexDirection: 'column',
            rowGap: 1,
            p: 0,
            mb: 3,
            listStylePosition: 'inside',
          }}
        >
          {list.map((item) => (
            <Text
              key={item}
              as="li"
              variant="paragraph3"
              sx={{
                alignItems: 'flex-start',
                display: 'list-item',
                color: 'neutral80',
                wordWrap: 'break-word',
              }}
            >
              {t(item)}
            </Text>
          ))}
        </Box>
        <AppLink href={link.href} sx={{ display: ['none', 'block'] }}>
          <WithArrow gap={1} sx={{ ...getAjnaWithArrowColorScheme() }}>
            {t(link.title)}
          </WithArrow>
        </AppLink>
        <Card
          sx={{
            width: '100%',
            mt: [0, '24px'],
            p: 4,
            pb: [4, banner.footer ? '24px' : 4],
            pt: [0, 4],
            border: 'none',
            borderRadius: 'large',
            background: ['none', gradient],
          }}
        >
          <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
            <Heading variant="boldParagraph3" sx={{ display: ['none', 'block'] }}>
              {t(banner.title)}
            </Heading>
            <Text as="p" sx={{ color: 'primary100', fontSize: '36px', fontWeight: 'semiBold' }}>
              {banner.value}{' '}
              <Text as="small" sx={{ fontSize: '28px' }}>
                AJNA
              </Text>
            </Text>
            <Text as="p" variant="paragraph2" sx={{ color: 'neutral80', mb: [4, '24px'] }}>
              {banner.subValue}
            </Text>
            <Button sx={{ mb: [0, banner.footer ? 3 : 0], fontSize: 1, p: 0 }}>
              <WithArrow
                gap={1}
                sx={{ color: 'inherit', fontSize: 'inherit', p: 2, pl: '24px', pr: '36px' }}
              >
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
