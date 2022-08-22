import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { Banner, bannerGradientPresets } from 'components/Banner'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { AppLink } from 'components/Links'
import { ContentCardOperatingCost } from 'components/vault/detailsSection/ContentCardOperatingCost'
import { ContentCardTargetMultiple } from 'components/vault/detailsSection/ContentCardTargetMultiple'
import { ContentCardTriggerColRatioToBuy } from 'components/vault/detailsSection/ContentCardTriggerColRatioToBuy'
import { ContentCardTriggerColRatioToSell } from 'components/vault/detailsSection/ContentCardTriggerColRatioToSell'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import { VaultType } from 'features/generalManageVault/vaultType'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useHash } from 'helpers/useHash'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export interface ConstantMultipleDetailsLayoutProps {
  token: string
  vaultType: VaultType
  isTriggerEnabled: boolean
  targetMultiple?: BigNumber
  targetColRatio?: BigNumber
  totalCost?: BigNumber
  PnLSinceEnabled?: BigNumber
  triggerColRatioToBuy?: BigNumber
  nextBuyPrice?: BigNumber
  triggerColRatioToSell?: BigNumber
  nextSellPrice?: BigNumber
  afterTargetMultiple?: number
  triggerColRatioToBuyToBuy?: BigNumber
  afterTriggerColRatioToSell?: BigNumber
}

export function ConstantMultipleDetailsLayout({
  token,
  vaultType,
  isTriggerEnabled,
  targetMultiple,
  targetColRatio,
  totalCost,
  PnLSinceEnabled,
  triggerColRatioToBuy,
  nextBuyPrice,
  triggerColRatioToSell,
  nextSellPrice,
  afterTargetMultiple,
  triggerColRatioToBuyToBuy,
  afterTriggerColRatioToSell,
}: ConstantMultipleDetailsLayoutProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()

  const [, setHash] = useHash()
  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  const isMultiplyVault = vaultType === VaultType.Multiply

  return (
    <Grid>
      {activeAutomationFeature?.currentOptimizationFeature === 'constantMultiple' ? (
        <DetailsSection
          title={t('constant-multiple.title')}
          badge={isTriggerEnabled}
          content={
            <DetailsSectionContentCardWrapper>
              <ContentCardTargetMultiple
                targetMultiple={targetMultiple}
                afterTargetMultiple={afterTargetMultiple}
                targetColRatio={targetColRatio}
                changeVariant="positive"
              />
              <ContentCardOperatingCost totalCost={totalCost} PnLSinceEnabled={PnLSinceEnabled} />
              <ContentCardTriggerColRatioToBuy
                token={token}
                triggerColRatio={triggerColRatioToBuy}
                afterTriggerColRatio={triggerColRatioToBuyToBuy}
                nextBuyPrice={nextBuyPrice}
                changeVariant="positive"
              />
              <ContentCardTriggerColRatioToSell
                token={token}
                triggerColRatio={triggerColRatioToSell}
                afterTriggerColRatio={afterTriggerColRatioToSell}
                nextSellPrice={nextSellPrice}
                changeVariant="positive"
              />
            </DetailsSectionContentCardWrapper>
          }
        />
      ) : (
        <>
          <Banner
            title={t(
              isMultiplyVault
                ? 'constant-multiple.banner.header'
                : 'constant-multiple.banner.header-no-multiply',
            )}
            description={
              <>
                {t(
                  isMultiplyVault
                    ? 'constant-multiple.banner.content'
                    : 'constant-multiple.banner.content-no-multiply',
                )}{' '}
                <AppLink
                  href="https://kb.oasis.app/help/what-is-constant-multiple"
                  sx={{ fontSize: 2 }}
                >
                  {t('here')}.
                </AppLink>
              </>
            }
            image={{
              src: '/static/img/setup-banner/constant-multiply.svg',
              backgroundColor: bannerGradientPresets.constantMultiply[0],
              backgroundColorEnd: bannerGradientPresets.constantMultiply[1],
            }}
            button={{
              action: () => {
                if (isMultiplyVault) {
                  uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
                    type: 'Optimization',
                    currentOptimizationFeature: 'constantMultiple',
                  })
                } else {
                  setHash(VaultViewMode.Overview)
                }
              },
              text: t(
                isMultiplyVault
                  ? 'constant-multiple.banner.button'
                  : 'constant-multiple.banner.button-no-multiply',
              ),
            }}
          />
        </>
      )}
    </Grid>
  )
}
