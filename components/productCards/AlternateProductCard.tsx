import { Icon } from '@makerdao/dai-ui-icons'
import { AppLink } from 'components/Links'
import { ProductCardLabels } from 'components/ProductCardLabels'
import { useTranslation } from 'next-i18next'
import React, { ReactNode, useCallback, useState } from 'react'
import { Box, Button, Card, Flex, Heading, Spinner, SxStyleProp, Text } from 'theme-ui'
import { fadeInAnimation } from 'theme/animations'

interface AlternateProductCardProps {
  header: string
  background: string
  icon: string
  banner: {
    titleKey: string
    tokens: string[]
  }
  button: {
    labelKey: string
    link: string
    hash?: string
    onClick?: () => void
  }
  labels?: {
    titleKey: string
    value: ReactNode
    textSx?: SxStyleProp
  }[]
}

export function AlternateProductCard({
  background,
  icon,
  banner,
  button,
  header,
  labels,
}: AlternateProductCardProps) {
  const [clicked, setClicked] = useState(false)
  const { t } = useTranslation()

  const handleClick = useCallback(() => {
    setClicked(true)
    button.onClick?.()
  }, [])

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: '353px',
        height: '100%',
      }}
    >
      <Card
        sx={{
          background,
          border: 'unset',
          p: 4,
          height: '100%',
          ...fadeInAnimation,
        }}
      >
        <Flex
          sx={{
            top: '-54.5px',
            left: '50%',
            transform: 'translateX(-50%)',
            position: 'absolute',
            height: '109px',
            width: '109px',
            backgroundColor: 'white',
            borderRadius: '50%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon name={icon} size={108} />
        </Flex>
        <Flex
          sx={{ flexDirection: 'column', justifyContent: 'flex-start', gap: 4, height: '100%' }}
        >
          <Flex sx={{ justifyContent: 'center', mt: '39px' }}>
            <Heading sx={{ fontSize: 5 }}>{header}</Heading>
          </Flex>
          <Card sx={{ border: 'unset' }}>
            <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
              <Text as="p" sx={{ color: 'neutral80', fontSize: 2 }} variant="paragraph2">
                {t(banner.titleKey)}
              </Text>
              <Text as="p" variant="boldParagraph1" sx={{ textAlign: 'center', fontSize: 2 }}>
                {banner.tokens.join(', ')}
              </Text>
            </Flex>
          </Card>
          <ProductCardLabels
            labels={labels?.map((item) => ({ title: t(item.titleKey), ...item }))}
          />
          <Flex
            sx={{
              marginTop: 'auto',
            }}
          >
            <AppLink
              href={button.link}
              sx={{ width: '100%' }}
              onClick={handleClick}
              hash={button.hash}
            >
              <Button
                variant="primary"
                sx={{
                  width: '100%',
                  height: '54px',
                  fontWeight: 'semiBold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.13)',
                  backgroundColor: 'primary100',
                  '&:hover': {
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
                    backgroundColor: 'primary60',
                    cursor: 'pointer',
                  },
                }}
              >
                {t(button.labelKey)}
                {clicked && (
                  <Spinner
                    variant="styles.spinner.medium"
                    size={20}
                    sx={{
                      color: 'white',
                      boxSizing: 'content-box',
                    }}
                  />
                )}
              </Button>
            </AppLink>
          </Flex>
        </Flex>
      </Card>
    </Box>
  )
}
