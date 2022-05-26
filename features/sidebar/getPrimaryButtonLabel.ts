import BigNumber from 'bignumber.js'
import { SidebarFlow } from 'features/types/vaults/sidebarLabels'
import { GetPrimaryButtonLabelParams } from 'helpers/extractSidebarHelpers'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { useTranslation } from 'next-i18next'

function getPrimaryButtonLabelEditingTranslationKey({ flow }: { flow: SidebarFlow }) {
  switch (flow) {
    case 'openBorrow':
    case 'openMultiply':
      return 'confirm'
    case 'addSl':
      return 'add-stop-loss'
    case 'adjustSl':
      return 'update-stop-loss'
    default:
      throw new UnreachableCaseError(flow)
  }
}

function getPrimaryButtonLabelTxInProgressTranslationKey({ flow }: { flow: SidebarFlow }) {
  switch (flow) {
    case 'openBorrow':
    case 'openMultiply':
      return 'creating-vault'
    case 'addSl':
      return 'add-stop-loss'
    case 'adjustSl':
      return 'update-stop-loss'
    default:
      throw new UnreachableCaseError(flow)
  }
}

function getPrimaryButtonLabelTxSuccessData({ flow, id }: { flow: SidebarFlow; id?: BigNumber }) {
  switch (flow) {
    case 'openBorrow':
    case 'openMultiply':
      return { key: 'go-to-vault', id }
    case 'addSl':
    case 'adjustSl':
      return { key: 'back-to-vault-overview' }
    default:
      throw new UnreachableCaseError(flow)
  }
}

const flowsWithoutProxy = ['adjustSl', 'addSl']

export function getPrimaryButtonLabel({
  stage,
  id,
  token,
  proxyAddress,
  insufficientAllowance,
  flow,
}: GetPrimaryButtonLabelParams): string {
  const { t } = useTranslation()

  switch (stage) {
    case 'editing':
      if (!proxyAddress && !flowsWithoutProxy.includes(flow)) return t('setup-proxy')
      if (insufficientAllowance) return t('set-token-allowance', { token })

      const editingKey = getPrimaryButtonLabelEditingTranslationKey({ flow })

      return t(editingKey)
    case 'proxyWaitingForConfirmation':
      return t('create-proxy-btn')
    case 'proxyWaitingForApproval':
    case 'proxyInProgress':
      return t('creating-proxy')
    case 'proxyFailure':
      return t('retry-create-proxy')
    case 'proxySuccess':
      return insufficientAllowance ? t('set-token-allowance', { token }) : t('continue')
    case 'allowanceWaitingForConfirmation':
      return t('set-token-allowance', { token: token })
    case 'allowanceWaitingForApproval':
    case 'allowanceInProgress':
      return t('approving-allowance')
    case 'allowanceFailure':
      return t('retry-allowance-approval')
    case 'allowanceSuccess':
      return t('continue')
    case 'txFailure':
      return t('retry')
    case 'txInProgress':
      const txInProgressKey = getPrimaryButtonLabelTxInProgressTranslationKey({ flow })

      return t(txInProgressKey)
    case 'txSuccess':
      const txSuccessKey = getPrimaryButtonLabelTxSuccessData({ flow, id })

      return t(txSuccessKey.key, txSuccessKey.id && { id: txSuccessKey.id.toString() })
    case 'txWaitingForApproval':
    case 'txWaitingForConfirmation':
      return t('create-vault')
    default:
      throw new UnreachableCaseError(stage)
  }
}
