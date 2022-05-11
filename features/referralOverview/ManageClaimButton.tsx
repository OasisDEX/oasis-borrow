// import { trackingEvents } from 'analytics/analytics'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Flex, Spinner, Text } from 'theme-ui'

// import { UnreachableCaseError } from 'ts-essentials'
import { ClaimState } from './manageClaimTransitions'
// import { performClaimMultiple } from './performClaimMultiple'

function manageClaimButtonText(state: ClaimState): string {
  const { t } = useTranslation()

  switch (state.stage) {
    case 'txSuccess':
      return t('approving-allowance')

    case 'txFailure':
      return t('confirm')

    case 'txWaitingForApproval':
      return t('retry')

    case 'claim':
      return t('ref.claim')

    case 'txInProgress':
      return 'Claiming DAI fees'

    default:
      return "Something's wrong"
  }
}

export function ManageClaimButton(props: ClaimState) {
  const { performClaimMultiple } = props

  function handleProgress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    performClaimMultiple()
  }

  const buttonText = manageClaimButtonText(props)

  /*   function trackEvents() {
    // if (stage === 'daiEditing' && generateAmount && generateAmount.gt(0)) {
    //   trackingEvents.manageDaiGenerateConfirm()
    // }
    // if (stage === 'daiEditing' && paybackAmount && paybackAmount.gt(0)) {
    //   trackingEvents.manageDaiPaybackConfirm()
    // }
    // if (stage === 'collateralEditing' && depositAmount && depositAmount.gt(0)) {
    //   trackingEvents.manageCollateralDepositConfirm()
    // }
    // if (stage === 'collateralEditing' && withdrawAmount && withdrawAmount.gt(0)) {
    //   trackingEvents.manageCollateralWithdrawConfirm()
    // }
    if (stage === 'collateralAllowanceWaitingForConfirmation') {
      trackingEvents.manageCollateralApproveAllowance()
    }
    if (stage === 'daiAllowanceWaitingForConfirmation') {
      trackingEvents.manageDaiApproveAllowance()
    }
  }

  if (stage === 'manageInProgress') {
    return null
  } */

  return (
    <>
      <Button
        variant="secondary"
        onClick={(e: React.SyntheticEvent<HTMLButtonElement>) => {
          //trackEvents()
          handleProgress(e)
        }}
        // when claims = 0
        // disabled={!canProgress}
      >
        {false ? (
          <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text sx={{ position: 'relative' }} pl={2}>
              <Spinner
                size={25}
                color="surface"
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translate(-105%, -50%)',
                }}
              />
              {buttonText}
            </Text>
          </Flex>
        ) : (
          <Text>{buttonText}</Text>
        )}
      </Button>
    </>
  )
}
