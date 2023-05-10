import { Icon } from '@makerdao/dai-ui-icons'
import { AppLink } from 'components/Links'
import { ProtocolLabel, ProtocolLabelProps } from 'components/ProtocolLabel'
import { WithArrow } from 'components/WithArrow'
import React from 'react'
import { Box, Flex, Heading, SxStyleProp, Text } from 'theme-ui'

type PromoCardVariant = 'neutral' | 'positive' | 'negative'

interface PromoCardProps {
  icon: string
  title: string
  protocol?: ProtocolLabelProps
  description?: string
  pills?: {
    label: string
    variant?: PromoCardVariant
  }[]

  link?: {
    href: string
    label: string
  }
  data?: {
    label: string
    value: string
    variant?: PromoCardVariant
  }[]
}

const pillColors: { [key in PromoCardVariant]: SxStyleProp } = {
  negative: { color: 'critical100', borderColor: 'critical100' },
  positive: { color: 'success100', borderColor: 'success100' },
  neutral: { color: 'neutral80', borderColor: 'neutral20' },
}

export const dataColors: { [key in PromoCardVariant]: SxStyleProp } = {
  negative: { color: 'critical100' },
  positive: { color: 'success100' },
  neutral: { color: 'primary100' },
}

export function PromoCard({
  data,
  description,
  icon,
  link,
  pills,
  protocol,
  title,
}: PromoCardProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        p: '24px',
        textAlign: 'center',
        border: '1px solid',
        borderColor: 'neutral20',
        borderRadius: 'large',
        bg: 'neutral10',
      }}
    >
      <Icon name={icon} size={50} sx={{ display: 'block', mx: 'auto', mb: '12px' }} />
      {protocol && (
        <Box sx={{ position: 'absolute', top: '12px', right: '12px' }}>
          <ProtocolLabel network={protocol.network} protocol={protocol.protocol} />
        </Box>
      )}
      <Heading as="h3" variant="boldParagraph2">
        {title}
      </Heading>
      {description && (
        <Text as="p" variant="paragraph3" sx={{ mt: 2 }}>
          {description}
        </Text>
      )}
      {pills && (
        <Flex
          as="ul"
          sx={{
            listStyle: 'none',
            justifyContent: 'center',
            columnGap: 2,
            mx: 0,
            mt: '12px',
            p: 0,
          }}
        >
          {pills.map(({ label, variant = 'neutral' }) => (
            <Flex
              as="li"
              variant="text.paragraph4"
              sx={{
                alignItems: 'center',
                height: '30px',
                px: '12px',
                border: '1px solid',
                borderColor: 'neutral20',
                borderRadius: 'large',
                ...pillColors[variant],
              }}
            >
              {label}
            </Flex>
          ))}
        </Flex>
      )}
      {link && (
        <AppLink href={link.href} sx={{ display: 'inline-block', mt: 2 }}>
          <WithArrow variant="paragraph3" sx={{ color: 'interactive100', fontWeight: 'regular' }}>
            {link.label}
          </WithArrow>
        </AppLink>
      )}
      {data && (
        <Flex as="ul" sx={{ listStyle: 'none', mx: 0, mt: 3, p: 0 }}>
          {data.map(({ label, value, variant = 'neutral' }) => (
            <Flex as="li" sx={{ justifyContent: 'space-between', width: '100%' }}>
              <Text as="span" variant="paragraph3" sx={{ color: 'neutral80' }}>
                {label}
              </Text>
              <Text as="span" variant="boldParagraph3" sx={dataColors[variant]}>
                {variant === 'negative' && <Icon name="arrow_decrease" size={12} sx={{ mr: 1 }} />}
                {variant === 'positive' && <Icon name="arrow_increase" size={12} sx={{ mr: 1 }} />}
                {value}
              </Text>
            </Flex>
          ))}
        </Flex>
      )}
    </Box>
  )
}
