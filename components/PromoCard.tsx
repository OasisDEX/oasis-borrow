import { Icon } from '@makerdao/dai-ui-icons'
import { AppLink } from 'components/Links'
import { ProtocolLabel, ProtocolLabelProps } from 'components/ProtocolLabel'
import { Skeleton } from 'components/Skeleton'
import { TokensGroup } from 'components/TokensGroup'
import { Translatable, TranslatableType } from 'components/Translatable'
import React, { FC } from 'react'
import { Box, Flex, Heading, Image, SxStyleProp, Text } from 'theme-ui'

export type PromoCardVariant = 'neutral' | 'positive' | 'negative'

export interface PromoCardWrapperProps {
  link?: string
}

interface PromoCardPropsWithIcon {
  icon: string
  image?: never
  tokens?: never
}

interface PromoCardPropsWithImage {
  icon?: never
  image: string
  tokens?: never
}

interface PromoCardPropsWithTokens {
  icon?: never
  image?: never
  tokens: string[]
}

export type PromoCardProps = (
  | PromoCardPropsWithIcon
  | PromoCardPropsWithImage
  | PromoCardPropsWithTokens
) & {
  title: TranslatableType
  protocol?: ProtocolLabelProps
  description?: TranslatableType
  pills?: {
    label: TranslatableType
    variant?: PromoCardVariant
  }[]
  link?: {
    href: string
    label?: TranslatableType
  }
  data?: {
    label: TranslatableType
    value: TranslatableType
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

export const PromoCardWrapper: FC<PromoCardWrapperProps> = ({ children, link }) => {
  const sx: SxStyleProp = {
    position: 'relative',
    px: 3,
    py: '24px',
    textAlign: 'center',
    border: '1px solid',
    borderColor: 'neutral20',
    borderRadius: 'large',
    bg: 'neutral10',
  }

  return (
    <>
      {link ? (
        <AppLink
          href={link}
          sx={{
            ...sx,
            fontWeight: 'inherit',
            transition: 'border-color 200ms',
            '&:hover': {
              borderColor: 'neutral70',
            },
          }}
        >
          {children}
        </AppLink>
      ) : (
        <Box sx={sx}>{children}</Box>
      )}
    </>
  )
}

export const PromoCardLoadingState: FC = () => {
  return (
    <PromoCardWrapper>
      <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
        <Flex>
          <Box sx={{ mr: '-20px' }}>
            <Skeleton circle width="42px" height="42px" sx={{ mt: 1, mr: '-30px' }} />
          </Box>
          <Box>
            <Skeleton circle width="42px" height="42px" sx={{ mt: 1 }} />
          </Box>
        </Flex>
        <Skeleton width="200px" sx={{ mt: '20px' }} />
        <Skeleton width="280px" height="30px" sx={{ mt: 3 }} />
        <Skeleton sx={{ mt: '22px' }} />
      </Flex>
    </PromoCardWrapper>
  )
}

export const PromoCard: FC<PromoCardProps> = ({
  data,
  description,
  icon,
  image,
  link,
  pills,
  protocol,
  title,
  tokens,
}) => {
  return (
    <PromoCardWrapper link={link?.href}>
      <Flex
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          height: '50px',
          mx: 'auto',
          mb: '12px',
        }}
      >
        {icon && <Icon name={icon} size={44} />}
        {tokens && <TokensGroup tokens={tokens} forceSize={50} />}
        {image && <Image src={image} sx={{ height: '44px' }} />}
      </Flex>
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
      <Heading as="h3" variant="boldParagraph2" sx={{ fontSize: '15px' }}>
        <Translatable text={title} />
      </Heading>
      {description && (
        <Text as="p" variant="paragraph3" sx={{ mt: 2 }}>
          <Translatable text={description} />
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
              <Translatable text={label} />
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
                <Translatable text={label} />
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
      {link?.label && (
        <Text as="p" sx={{ mt: 2, fontSize: 2, color: 'interactive100' }}>
          <Translatable text={link.label} /> →
        </Text>
      )}
    </PromoCardWrapper>
  )
}
