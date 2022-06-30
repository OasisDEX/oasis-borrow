import { DefaultVaultLayout } from 'components/vault/DefaultVaultLayout'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { GeneralManageVaultState } from '../../features/generalManageVault/generalManageVault'
import { VaultType } from '../../features/generalManageVault/vaultType'
import { formatFiatBalance, formatPercent } from '../../helpers/formatters/format'
import { VaultInformation } from './VaultInformation'

interface VaultInformationControlProps {
  generalManageVault: GeneralManageVaultState
}

export function VaultInformationControl({ generalManageVault }: VaultInformationControlProps) {
  const { t } = useTranslation()
  const {
    ilkData: { stabilityFee, debtFloor, liquidationPenalty, liquidationRatio },
    vault,
  } = generalManageVault.state
  const vaultType = generalManageVault.type

  const idData = {
    text: t('system.vault-id'),
    value: vault.id.toString(),
  }

  const stabilityFeeData = {
    text: t('system.stability-fee'),
    value: formatPercent(stabilityFee.times(100), { precision: 2 }),
  }

  const liquidationPenaltyData = {
    text: t('system.liquidation-fee'),
    value: formatPercent(liquidationPenalty.times(100), { precision: 2 }),
  }

  const liquidationRatioData = {
    text: t('system.minimum-coll-ratio'),
    value: formatPercent(liquidationRatio.times(100), { precision: 2 }),
  }

  const dustLimitData = {
    text: t('system.dust-limit'),
    value: `$${formatFiatBalance(debtFloor)}`,
  }

  const originationFeePercentData = {
    text: t('system.origination-fee'),
    value:
      'originationFeePercent' in vault
        ? formatPercent(vault.originationFeePercent.times(100), { precision: 2 })
        : '-',
  }

  const defaultItems = [
    idData,
    stabilityFeeData,
    liquidationPenaltyData,
    liquidationRatioData,
    dustLimitData,
  ]
  const guniItems = [idData, stabilityFeeData, dustLimitData]
  const instiItems = [...defaultItems, originationFeePercentData]

  const isGuniVault = ['GUNIV3DAIUSDC1-A', 'GUNIV3DAIUSDC2-A'].includes(vault.ilk)
  const isInstiVault = vaultType === VaultType.Insti

  const vaultInfoItems = isGuniVault ? guniItems : isInstiVault ? instiItems : defaultItems

  return <DefaultVaultLayout detailsViewControl={<VaultInformation items={vaultInfoItems} />} />
}
