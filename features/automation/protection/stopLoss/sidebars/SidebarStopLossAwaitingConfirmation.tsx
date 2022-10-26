import BigNumber from "bignumber.js"
import { Vault } from "blockchain/vaults"
import { Text } from 'theme-ui';
import React from 'react';
import { useTranslation } from "next-i18next"
import { IlkData } from "blockchain/ilks"
import { SetDownsideProtectionInformation } from "./SidebarAdjustStopLossEditingStage";


interface SidebarStopLossAwaitingConfirmationProps {
  vault: Vault
  ilkData: IlkData
  afterStopLossRatio: BigNumber
  executionPrice: BigNumber
  ethPrice: BigNumber
  isCollateralActive: boolean
  isOpenFlow?: boolean
}

export function SidebarStopLossAwaitingConfirmation({
  afterStopLossRatio,
  vault,
  ilkData,
  isCollateralActive,
  executionPrice,
  ethPrice,
  isOpenFlow
}: SidebarStopLossAwaitingConfirmationProps) {
  const { t } = useTranslation();

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('protection.confirmation-text')}
      </Text>
      <SetDownsideProtectionInformation
        vault={vault}
        ilkData={ilkData}
        afterStopLossRatio={afterStopLossRatio}
        executionPrice={executionPrice}
        ethPrice={ethPrice}
        isCollateralActive={isCollateralActive}
        isOpenFlow={isOpenFlow}
      />
    </>
  )
}