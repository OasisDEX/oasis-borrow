import type BigNumber from 'bignumber.js'
import type { NetworkNames } from 'blockchain/networks'
import { Icon } from 'components/Icon'
import { InfoSection } from 'components/infoSection/InfoSection'
import { ItemValueWithIcon } from 'components/infoSection/ItemValueWithIcon'
import { ProtocolLabel } from 'components/ProtocolLabel'
import { TokensGroup } from 'components/TokensGroup'
import { RefinanceAutomationSection } from 'features/refinance/components'
import { RefinancePositionViewType } from 'features/refinance/types'
import { formatCryptoBalance, formatLtvDecimalAsPercent } from 'helpers/formatters/format'
import type { LendingProtocol } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { eye } from 'theme/icons'
import { Card, Divider, Flex, Text } from 'theme-ui'
import type { PortfolioPositionAutomations } from 'handlers/portfolio/types'

const Wrapper: FC = ({ children }) => (
  <Card sx={{ backgroundColor: 'neutral30', flex: 1, px: '24px', py: '28px', minWidth: '300px' }}>
    {children}
  </Card>
)

type RefinancePositionViewProps<Type extends RefinancePositionViewType> =
  Type extends RefinancePositionViewType.EMPTY
    ? { type: Type }
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
        }
        positionData: {
          ltv: BigNumber
          collateral: BigNumber
          debt: BigNumber
          liquidationPrice: BigNumber
        }
        type: Type
        automations: PortfolioPositionAutomations
        positionId?: BigNumber
      }

export const RefinancePositionView = <Type extends RefinancePositionViewType>(
  props: RefinancePositionViewProps<Type>,
) => {
  const { t } = useTranslation()
  if (props.type === RefinancePositionViewType.EMPTY) {
    return (
      <Wrapper>
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
          <Text as="h3" sx={{ fontSize: 3, fontWeight: 'semiBold' }}>
            {t('refinance.position.empty.title')}
          </Text>
          <Text as="p" sx={{ fontSize: 2, color: 'neutral80' }}>
            {t('refinance.position.empty.description')}
          </Text>
        </Flex>
      </Wrapper>
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

  const formatted = {
    ltv: formatLtvDecimalAsPercent(positionData.ltv),
    liquidationPrice: formatCryptoBalance(positionData.liquidationPrice),
    collateral: (
      <ItemValueWithIcon tokens={[primaryToken]}>
        {formatCryptoBalance(positionData.collateral)}
      </ItemValueWithIcon>
    ),
    debt: (
      <ItemValueWithIcon tokens={[secondaryToken]}>
        {formatCryptoBalance(positionData.debt)}
      </ItemValueWithIcon>
    ),
    maxLtv: formatLtvDecimalAsPercent(poolData.maxLtv),
    borrowRate: formatLtvDecimalAsPercent(poolData.borrowRate),
  }

  const positionInfoSectionItems = [
    {
      label: t('system.ltv-short'),
      value: formatted.ltv,
    },
    {
      label: `${t('system.liq-price-short')} (${primaryToken}/${secondaryToken})`,
      value: formatted.liquidationPrice,
    },
    {
      label: t('system.collateral'),
      value: formatted.collateral,
    },
    {
      label: t('system.debt'),
      value: formatted.debt,
    },
  ]

  const poolInfoSectionItems = [
    {
      label: t('max-ltv'),
      value: formatted.maxLtv,
      tooltip: 'TBD',
    },
    {
      label: t('system.borrow-rate'),
      value: formatted.borrowRate,
      tooltip: 'TBD',
    },
    {
      label: t('system.protocol'),
      value: <ProtocolLabel network={protocolData.network} protocol={protocolData.protocol} />,
    },
  ]

  return (
    <Wrapper>
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
    </Wrapper>
  )
}
