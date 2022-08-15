import { collateralPriceAtRatio } from "blockchain/vault.maths"
import { AppLink } from "components/Links"
import { MaxGasPriceSection } from "features/automation/basicBuySell/MaxGasPriceSection/MaxGasPriceSection"
import { useTranslation } from "next-i18next"
import { AutoBuyInfoSectionControl, SidebarAutoBuyEditingStageProps } from "./SidebarAutoBuyEditingStage"
import { Text } from 'theme-ui';
import { BasicBSFormChange } from "features/automation/protection/common/UITypes/basicBSFormChange"
import { Vault } from "blockchain/vaults"
import BigNumber from "bignumber.js"

interface SidebarAutoBuyConfirmationStageProps {
  basicBuyState: BasicBSFormChange;
  vault: Vault;
  debtDelta: BigNumber;
  collateralDelta: BigNumber;
}

export function SidebarAutoBuyConfirmationStage({
  basicBuyState,
  vault,
  debtDelta,
  collateralDelta
}: SidebarAutoBuyConfirmationStageProps) {
  const { t } = useTranslation();

  const executionPrice = collateralPriceAtRatio({
    colRatio: basicBuyState.execCollRatio.div(100),
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {basicBuyState.maxBuyOrMinSellPrice !== undefined
          ? t('auto-buy.set-trigger-description', {
            targetCollRatio: basicBuyState.targetCollRatio.toNumber(),
            token: vault.token,
            execCollRatio: basicBuyState.execCollRatio,
            executionPrice: executionPrice.toFixed(2),
            minBuyPrice: basicBuyState.maxBuyOrMinSellPrice,
          })
          : t('auto-buy.set-trigger-description-no-threshold', {
            targetCollRatio: basicBuyState.targetCollRatio.toNumber(),
            token: vault.token,
            execCollRatio: basicBuyState.execCollRatio,
            executionPrice: executionPrice.toFixed(2),
          })}{' '}
        {/* TODO ŁW link to article in kb */}
        <AppLink href="https://kb.oasis.app/help/" sx={{ fontSize: 2 }}>
          {t('here')}.
        </AppLink>
      </Text>{' '}
      <MaxGasPriceSection
        value={basicBuyState.maxBaseFeeInGwei.toNumber()}
        onChange={() => { }}
        isPreviewOnly
      />

      <AutoBuyInfoSectionControl
        executionPrice={executionPrice}
        basicBuyState={basicBuyState}
        vault={vault}
        debtDelta={debtDelta}
        collateralDelta={collateralDelta}
      />
    </>
  )
}