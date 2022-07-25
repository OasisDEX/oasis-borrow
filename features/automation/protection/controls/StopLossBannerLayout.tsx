import { BigNumber } from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Box, Button, Card, Flex, Grid, Image, Text } from 'theme-ui'

import { AfterPillProps, VaultDetailsAfterPill } from '../../../../components/vault/VaultDetails'
import { WithArrow } from '../../../../components/WithArrow'
import { formatAmount, formatPercent } from '../../../../helpers/formatters/format'
import { staticFilesRuntimeUrl } from '../../../../helpers/staticPaths'
import { WithChildren } from '../../../../helpers/types'

interface StopLossBannerSectionProps {
  text: ReactNode
  value: ReactNode
  afterValue?: ReactNode
}

function StopLossBannerSection({
  text,
  value,
  afterValue,
  showAfterPill,
}: StopLossBannerSectionProps & AfterPillProps) {
  return (
    <Flex
      sx={{
        flexDirection: 'column',
        alignItems: ['center', 'flex-start'],
        justifyContent: 'center',
      }}
    >
      <Text variant="paragraph4" sx={{ fontWeight: 'semiBold', mb: 2, color: 'neutral80' }}>
        {text}
      </Text>
      <Text variant="header3" sx={{ fontWeight: 'semiBold' }}>
        {value}
      </Text>
      {afterValue && showAfterPill && (
        <VaultDetailsAfterPill afterPillColors={{ bg: 'secondary60', color: 'success100' }}>
          {afterValue} after
        </VaultDetailsAfterPill>
      )}
    </Flex>
  )
}

function StopLossBannerSectionCompact({ children }: WithChildren) {
  return (
    <Flex
      sx={{
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexWrap: 'wrap-reverse',
        mb: 1,
      }}
    >
      {children}
    </Flex>
  )
}

interface StopLossBannerLayoutProps {
  dynamicStopPrice: BigNumber
  afterDynamicStopPrice?: BigNumber
  stopLossLevel: BigNumber
  handleClick: () => void
  compact: boolean
}

export function StopLossBannerLayout({
  dynamicStopPrice,
  afterDynamicStopPrice,
  stopLossLevel,
  handleClick,
  showAfterPill,
  compact,
}: StopLossBannerLayoutProps & AfterPillProps) {
  const { t } = useTranslation()

  return compact ? (
    <Button
      variant="unStyled"
      onClick={handleClick}
      sx={{
        p: 0,
        '& .arrow': {
          transition: 'ease-in-out 0.2s',
          transform: 'translateX(0px)',
        },
        '&:hover .arrow': {
          transform: 'translateX(5px)',
        },
      }}
    >
      <Card
        sx={{
          background: 'linear-gradient(92.87deg, #F0FCFF 13.82%, #FFEFFA 88.81%), #FFFFFF',
          mb: 3,
          py: '21px',
          height: ['auto', '91px'],
        }}
      >
        <Flex sx={{ height: '100%' }}>
          <Flex sx={{ justifyContent: 'center', alignItems: 'center', width: '40px' }}>
            <Image src={staticFilesRuntimeUrl('/static/img/protection.svg')} />
          </Flex>
          <Flex sx={{ flex: 1, flexDirection: 'column', justifyContent: 'center', ml: 2 }}>
            <StopLossBannerSectionCompact>
              <Text variant="header3" sx={{ fontWeight: 'body', mr: 2 }}>
                {`$${formatAmount(dynamicStopPrice, 'USD')}`}
              </Text>
              <Text variant="paragraph4" sx={{ fontWeight: 'semiBold', color: 'neutral80', pt: 1 }}>
                {t('protection.dynamic-stop-loss-price')}
              </Text>
            </StopLossBannerSectionCompact>
            <StopLossBannerSectionCompact>
              <Text variant="header3" sx={{ fontWeight: 'body', fontSize: 2, mr: 2 }}>
                {formatPercent(stopLossLevel.times(100), { precision: 2 })}
              </Text>
              <Text variant="paragraph4" sx={{ fontWeight: 'semiBold', color: 'neutral80' }}>
                {t('protection.stop-loss-coll-ratio')}
              </Text>
            </StopLossBannerSectionCompact>
          </Flex>
          <Flex
            sx={{
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: ['center', 'flex-start'],
              width: '24px',
            }}
          >
            <Box
              className="arrow"
              sx={{ display: 'inline', position: 'absolute', color: 'neutral80', fontSize: '20px' }}
            >
              →
            </Box>
          </Flex>
        </Flex>
      </Card>
    </Button>
  ) : (
    <Card
      sx={{
        background: 'linear-gradient(92.87deg, #F0FCFF 13.82%, #FFEFFA 88.81%), #FFFFFF',
        mb: 3,
        py: '24px',
        height: ['auto', '132px'],
      }}
    >
      <Grid columns={[1, '90px 1fr 1fr 1fr']} sx={{ height: '100%' }}>
        <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
          <Image src={staticFilesRuntimeUrl('/static/img/protection.svg')} />
        </Flex>
        <StopLossBannerSection
          text={t('protection.dynamic-stop-loss-price')}
          value={`$${formatAmount(dynamicStopPrice, 'USD')}`}
          afterValue={afterDynamicStopPrice && `$${formatAmount(afterDynamicStopPrice, 'USD')}`}
          showAfterPill={showAfterPill}
        />
        <StopLossBannerSection
          text={t('protection.stop-loss-coll-ratio')}
          value={formatPercent(stopLossLevel.times(100), { precision: 2 })}
        />
        <Flex
          sx={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: ['center', 'flex-start'],
          }}
        >
          <Button variant="unStyled" onClick={handleClick} sx={{ p: 0 }}>
            <WithArrow sx={{ color: 'interactive100' }}>
              <Text
                sx={{
                  display: 'inline',
                  color: 'interactive100',
                  fontSize: 1,
                  fontWeight: 'semiBold',
                }}
                variant="paragraph1"
              >
                {t('protection.edit-vault-protection')}
              </Text>
            </WithArrow>
          </Button>
        </Flex>
      </Grid>
    </Card>
  )
}
