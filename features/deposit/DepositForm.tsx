import BigNumber from 'bignumber.js'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatAmount } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useCallback } from 'react'
import { createNumberMask } from 'text-mask-addons'
import { Box, Button, Grid, Heading, Label, Text } from 'theme-ui'

import { getToken } from '../../blockchain/tokensMetadata'
import { useAppContext } from '../../components/AppContextProvider'
import { Modal, ModalCloseIcon } from '../../components/Modal'

export function DepositForm({ close, vaultId }: { close: () => void; vaultId: BigNumber }) {
  const { depositForm$ } = useAppContext()
  const depositForm = useObservable(depositForm$(vaultId))

  const closeModal = useCallback(() => {
    depositForm?.reset && depositForm.reset()
    close()
  }, [depositForm])

  const onDepositChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const value = e.target.value.replace(/,/g, '')

      depositForm?.change({
        kind: 'lockAmount',
        lockAmount: value === '' ? undefined : new BigNumber(value),
      })
    },
    [depositForm?.change],
  )

  const onGenerateChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const value = e.target.value.replace(/,/g, '')

      depositForm?.change({
        kind: 'drawAmount',
        drawAmount: value === '' ? undefined : new BigNumber(value),
      })
    },
    [depositForm?.change],
  )

  if (!depositForm) {
    return null
  }

  const canEdit = depositForm.stage === 'editing'
  const canSubmit = depositForm.submit && depositForm.stage === 'editing'

  return (
    <Modal>
      <ModalCloseIcon close={closeModal} />
      <Grid sx={{ p: 4 }} variant="">
        <Box>
          <Heading>Deposit</Heading>
        </Box>
        <Box>
          <Label>
            <Text>Deposit</Text>
            <BigNumberInput
              disabled={!canEdit}
              mask={createNumberMask({
                allowDecimal: true,
                decimalLimit: getToken(depositForm?.vault?.token!).digits,
                prefix: '',
              })}
              onChange={onDepositChange}
              value={
                (depositForm?.lockAmount || null) &&
                formatAmount(depositForm?.lockAmount as BigNumber, depositForm?.vault?.token!)
              }
            />
          </Label>
          <Label>
            <Text>Generate</Text>
            <BigNumberInput
              disabled={!canEdit}
              mask={createNumberMask({
                allowDecimal: true,
                decimalLimit: getToken(depositForm?.vault?.token!).digits,
                prefix: '',
              })}
              onChange={onGenerateChange}
              value={
                (depositForm?.drawAmount || null) &&
                formatAmount(depositForm?.drawAmount as BigNumber, 'DAI')
              }
            />
          </Label>
        </Box>
        <Box>
          {depositForm?.messages.map((message) => (
            <Box key={message}>{message}</Box>
          ))}
        </Box>
        <Box>ETH balance: {depositForm.ethBalance.toString()}</Box>
        <Box>
          Balance: {depositForm.balance.toString()} {depositForm.vault.token}
        </Box>
        <Button disabled={!canSubmit} onClick={depositForm.submit}>
          Deposit
        </Button>
        <Box>{depositForm.stage !== 'editing' && `Transaction stage: ${depositForm.stage}`}</Box>
        <Box>{depositForm.txHash && `Transaction hash: ${depositForm.txHash}`}</Box>
      </Grid>
    </Modal>
  )
}
