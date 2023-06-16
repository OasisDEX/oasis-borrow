import { Icon } from '@makerdao/dai-ui-icons'
import { AppLink } from 'components/Links'
import { ProtocolLabel, ProtocolLabelProps } from 'components/ProtocolLabel'
import { Skeleton } from 'components/Skeleton'
import { WithArrow } from 'components/WithArrow'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Flex, Heading, SxStyleProp, Text } from 'theme-ui'

export type PromoCardVariant = 'neutral' | 'positive' | 'negative'

export interface PromoCardWrapperProps {
  withHover?: boolean
}

export interface PromoCardTranslationProps {
  key: string
  props?: { [key: string]: string }
}

export interface PromoCardProps {
  icon: string
  title: string | PromoCardTranslationProps
  protocol?: ProtocolLabelProps
  description?: string | PromoCardTranslationProps
  pills?: {
    label: string | PromoCardTranslationProps
    variant?: PromoCardVariant
  }[]
  link?: {
    href: string
    label: string | PromoCardTranslationProps
  }
  data?: {
    label: string | PromoCardTranslationProps
    value: string | PromoCardTranslationProps
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

export const PromoCardWrapper: FC<PromoCardWrapperProps> = ({ children, withHover = true }) => {
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
        transition: 'border-color 200ms',
        ...(withHover && {
          '&:hover': {
            borderColor: 'primary100',
          },
        }),
      }}
    >
      {children}
    </Box>
  )
}

export const PromoCardLoadingState: FC = () => {
  return (
    <PromoCardWrapper withHover={false}>
      <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
        <Skeleton circle width="42px" height="42px" sx={{ mt: 1 }} />
        <Skeleton width="200px" sx={{ mt: '20px' }} />
        <Skeleton width="200px" height="30px" sx={{ mt: 3 }} />
        <Skeleton sx={{ mt: '22px' }} />
      </Flex>
    </PromoCardWrapper>
  )
}

export const PromoCardTranslation: FC<{ text: string | PromoCardTranslationProps }> = ({
  text,
}) => {
  const { t } = useTranslation()

  return <>{typeof text === 'object' ? t(text.key, text.props) : text}</>
}

export const PromoCard: FC<PromoCardProps> = ({
  data,
  description,
  icon,
  link,
  pills,
  protocol,
  title,
}) => {
  return (
    <PromoCardWrapper>
      <Icon name={icon} size={50} sx={{ display: 'block', mx: 'auto', mb: '12px' }} />
      {protocol && (
        <Box
          sx={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            outline: '4px solid white',
            borderRadius: 'large',
          }}
        >
          <ProtocolLabel network={protocol.network} protocol={protocol.protocol} />
        </Box>
      )}
      <Heading as="h3" variant="boldParagraph2">
        <PromoCardTranslation text={title} />
      </Heading>
      {description && (
        <Text as="p" variant="paragraph3" sx={{ mt: 2 }}>
          <PromoCardTranslation text={description} />
        </Text>
      )}
      {pills && (
        <Flex
          as="ul"
          sx={{
            listStyle: 'none',
            justifyContent: 'center',
            gap: 2,
            flexWrap: 'wrap',
            mx: 0,
            mt: '12px',
            p: 0,
          }}
        >
          {pills.map(({ label, variant = 'neutral' }) => (
            <Flex
              key={JSON.stringify(label)}
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
              <PromoCardTranslation text={label} />
            </Flex>
          ))}
        </Flex>
      )}
      {data && (
        <Flex as="ul" sx={{ flexDirection: 'column', listStyle: 'none', mx: 0, mt: 3, p: 0 }}>
          {data.map(({ label, value, variant = 'neutral' }) => (
            <Flex
              key={JSON.stringify(label)}
              as="li"
              sx={{ justifyContent: 'space-between', width: '100%' }}
            >
              <Text as="span" variant="paragraph3" sx={{ color: 'neutral80' }}>
                <PromoCardTranslation text={label} />
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
      {link && (
        <AppLink href={link.href} sx={{ display: 'inline-block', mt: 2 }}>
          <WithArrow variant="paragraph3" sx={{ color: 'interactive100', fontWeight: 'regular' }}>
            <PromoCardTranslation text={link.label} />
          </WithArrow>
        </AppLink>
      )}
    </PromoCardWrapper>
  )
}
