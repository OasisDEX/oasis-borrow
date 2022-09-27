// import { Vault } from 'blockchain/vaults'

import React from 'react'

interface SetupAutoTakeProfitProps {
  //   vault: Vault
  isAutoTakeProfitActive: boolean
}

export function SetupAutoTakeProfit({ isAutoTakeProfitActive }: SetupAutoTakeProfitProps) {
  // TODO ŁW determine title upon conditions
  // const sidebarTitle = getAutomationFormTitle({
  //     flow,
  //     stage,
  //     feature,
  //   })

  if (isAutoTakeProfitActive) {
    // TODO ŁW
    // const sidebarSectionProps: SidebarSectionProps: {
    //     title: 'Auto Take-Profit',
    //     ...(isMultiplyVault && { dropdown }),
    //     content: (
    //       <Grid gap={3}>
    //         {(stage === 'editing' || stage === 'txFailure') && (
    //           <>
    //             {isAddForm && (
    //               <SidebarAutoBuyEditingStage
    //                 vault={vault}
    //                 ilkData={ilkData}
    //                 autoBuyState={autoBuyState}
    //                 isEditing={isEditing}
    //                 autoBuyTriggerData={autoBuyTriggerData}
    //                 errors={errors}
    //                 warnings={warnings}
    //                 debtDelta={debtDelta}
    //                 collateralDelta={collateralDelta}
    //                 sliderMin={min}
    //                 sliderMax={max}
    //                 stopLossTriggerData={stopLossTriggerData}
    //               />
    //             )}
    //             {isRemoveForm && (
    //               <SidebarAutoBuyRemovalEditingStage
    //                 vault={vault}
    //                 ilkData={ilkData}
    //                 errors={cancelAutoBuyErrors}
    //                 warnings={cancelAutoBuyWarnings}
    //                 autoBuyState={autoBuyState}
    //               />
    //             )}
    //           </>
    //         )}
    //         {(stage === 'txSuccess' || stage === 'txInProgress') && (
    //           <SidebarAutomationFeatureCreationStage
    //             featureName={feature}
    //             stage={stage}
    //             isAddForm={isAddForm}
    //             isRemoveForm={isRemoveForm}
    //           />
    //         )}
    //       </Grid>
    //     ),
    //     primaryButton: {
    //       label: primaryButtonLabel,
    //       disabled: isDisabled || !!validationErrors.length,
    //       isLoading: stage === 'txInProgress',
    //       action: () => txHandler(),
    //     },
    //     ...(stage !== 'txInProgress' && {
    //       textButton: {
    //         label: textButtonLabel,
    //         hidden: isFirstSetup,
    //         action: () => textButtonHandler(),
    //       },
    //     }),
    //     status: sidebarStatus,
  }
  // }

  return (
    <>
      <div>SetupAutoTakeProfit</div>
    </>
  )
}
