import BigNumber from 'bignumber.js'
import type { NetworkNames } from 'blockchain/networks'
import { Icon } from 'components/Icon'
import { InfoSection } from 'components/infoSection/InfoSection'
import type { ItemProps } from 'components/infoSection/Item'
import { ItemValueWithIcon } from 'components/infoSection/ItemValueWithIcon'
import { ProtocolLabel } from 'components/ProtocolLabel'
import { TokensGroup } from 'components/TokensGroup'
import { isShortPosition } from 'features/omni-kit/helpers'
import { RefinanceAutomationSection, RefinanceCardWrapper } from 'features/refinance/components'
import { RefinancePositionViewType } from 'features/refinance/types'
import type { PortfolioPositionAutomations } from 'handlers/portfolio/types'
import {
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatLtvDecimalAsPercent,
} from 'helpers/formatters/format'
import type { LendingProtocol } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { eye } from 'theme/icons'
import { Divider, Flex, Text } from 'theme-ui'

export type RefinancePositionViewProps<Type extends RefinancePositionViewType> =
  Type extends RefinancePositionViewType.EMPTY
    ? { type: Type }
    : Type extends RefinancePositionViewType.CLOSED
      ? {
          type: Type
          primaryToken: string
          secondaryToken: string
          positionId: string
        }
      : {
          primaryToken: string
          secondaryToken: string
          protocolData: {
            network: NetworkNames
            protocol: LendingProtocol
          }
          poolData: {
            borrowRate: BigNumber
            maxLtv: BigNumber
            borrowRateChange?: BigNumber
            maxLtvChange?: BigNumber
          }
          positionData?: {
            ltv: BigNumber
            collateral: BigNumber
            debt: BigNumber
            liquidationPrice: BigNumber
          }
          type: Type
          automations: PortfolioPositionAutomations
          positionId?: string
        }

export const RefinancePositionView = <Type extends RefinancePositionViewType>(
  props: RefinancePositionViewProps<Type>,
) => {
  const { t } = useTranslation()
  if (props.type === RefinancePositionViewType.EMPTY) {
    return (
      <RefinanceCardWrapper sx={{ height: ['auto', '522px'] }}>
        <Flex
          sx={{
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            height: '100%',
            justifyContent: 'center',
          }}
        >
          <Icon icon={eye} size="25px" color="primary60" />
          <Text as="h3" sx={{ fontSize: 3, fontWeight: 'semiBold', mb: 2 }}>
            {t('refinance.position.empty.title')}
          </Text>
          <Text as="p" sx={{ fontSize: 2, color: 'neutral80' }}>
            {t('refinance.position.empty.description')}
          </Text>
        </Flex>
      </RefinanceCardWrapper>
    )
  }

  if (props.type === RefinancePositionViewType.CLOSED) {
    return (
      <RefinanceCardWrapper sx={{ height: 'fit-content' }}>
        <Flex
          sx={{
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Text as="h2" sx={{ fontSize: 3, fontWeight: 'semiBold', mb: 3 }}>
            {t(`refinance.position.title.${props.type}`, {
              positionId: props.positionId,
            })}
          </Text>
          <Text as="p" sx={{ fontSize: 2, color: 'neutral80' }}>
            {t('refinance.position.closed.description', {
              pair: `${props.primaryToken}/${props.secondaryToken}`,
            })}
          </Text>
        </Flex>
      </RefinanceCardWrapper>
    )
  }
  const {
    primaryToken,
    secondaryToken,
    positionId,
    protocolData,
    type,
    positionData,
    poolData,
    automations,
  } = props

  const isShort = isShortPosition({ collateralToken: primaryToken })
  const priceFormat = isShort
    ? `${secondaryToken}/${primaryToken}`
    : `${primaryToken}/${secondaryToken}`

  const formattedLiquidationPrice = positionData?.liquidationPrice

  const formatted = {
    ltv: positionData?.ltv && formatLtvDecimalAsPercent(positionData.ltv),
    liquidationPrice: formattedLiquidationPrice && formatCryptoBalance(formattedLiquidationPrice),
    collateral: positionData?.collateral && (
      <ItemValueWithIcon tokens={[primaryToken]}>
        {formatCryptoBalance(positionData.collateral)}
      </ItemValueWithIcon>
    ),
    debt: positionData?.debt && (
      <ItemValueWithIcon tokens={[secondaryToken]}>
        {formatCryptoBalance(positionData.debt)}
      </ItemValueWithIcon>
    ),
    maxLtv: formatLtvDecimalAsPercent(poolData.maxLtv),
    ...(poolData.maxLtvChange && {
      maxLtvChange: formatLtvDecimalAsPercent(poolData.maxLtvChange, { plus: true }),
    }),
    borrowRate: formatLtvDecimalAsPercent(poolData.borrowRate),
    ...(poolData.borrowRateChange && {
      borrowRateChange: `${formatDecimalAsPercent(poolData.borrowRateChange, { plus: true })}`,
    }),
  }

  const isLoading = !positionData

  const positionInfoSectionItems: ItemProps[] = [
    {
      label: t('system.ltv-short'),
      value: formatted.ltv,
      isLoading,
    },
    {
      label: `${t('system.liq-price-short')} (${priceFormat})`,
      value: formatted.liquidationPrice,
      isLoading,
    },
    {
      label: t('system.collateral'),
      value: formatted.collateral,
      isLoading,
    },
    {
      label: t('system.debt'),
      value: formatted.debt,
      isLoading,
    },
  ]

  const poolInfoSectionItems: ItemProps[] = [
    {
      label: t('max-ltv'),
      value: formatted.maxLtv,
      ...(formatted.maxLtvChange && {
        secondary: {
          value: formatted.maxLtvChange,
          variant: poolData.maxLtvChange?.isPositive() ? 'positive' : 'negative',
        },
      }),
      tooltip: t('refinance.position.tooltips.max-ltv'),
    },
    {
      label: t('system.borrow-rate'),
      value: formatted.borrowRate,
      ...(formatted.borrowRateChange && {
        secondary: {
          value: formatted.borrowRateChange,
          variant: poolData.borrowRateChange?.isPositive() ? 'negative' : 'positive',
        },
      }),
      tooltip: t('refinance.position.tooltips.borrow-rate'),
    },
    {
      label: t('system.protocol'),
      value: <ProtocolLabel network={protocolData.network} protocol={protocolData.protocol} />,
    },
  ]

  return (
    <RefinanceCardWrapper>
      <Flex sx={{ flexDirection: 'column', rowGap: '24px' }}>
        <Flex sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: [3, 0] }}>
          <TokensGroup tokens={[primaryToken, secondaryToken]} forceSize={22} />
          <Text as="h2" sx={{ fontSize: 3, fontWeight: 'semiBold', ml: 2 }}>
            {t(`refinance.position.title.${type}`, {
              pair: `${primaryToken}/${secondaryToken}`,
              positionId,
            })}
          </Text>
        </Flex>
        <InfoSection
          items={positionInfoSectionItems}
          wrapperSx={{ backgroundColor: 'white', boxShadow: '0px 0px 8px 0px rgba(0, 0, 0, 0.1)' }}
          itemWrapperSx={{ fontSize: 2 }}
        />
        <InfoSection
          withListPadding={false}
          items={poolInfoSectionItems}
          wrapperSx={{ backgroundColor: 'unset' }}
          itemWrapperSx={{ fontSize: 2 }}
        />
        <Divider />
        <RefinanceAutomationSection
          automations={automations}
          withFooter={type === RefinancePositionViewType.SIMULATION}
        />
      </Flex>
    </RefinanceCardWrapper>
  )
}
