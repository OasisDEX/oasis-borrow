import { Modal, ModalCloseIcon, } from '../../components/Modal'
import { Text, Label, Heading, Button, Box, Grid } from 'theme-ui';
import { useAppContext } from '../../components/AppContextProvider';
import { useObservable } from 'helpers/observableHook';
import { BigNumberInput } from 'helpers/BigNumberInput'
import { useCallback } from 'react';
import BigNumber from 'bignumber.js';
import { createNumberMask } from 'text-mask-addons';
import { getToken } from '../../components/blockchain/config';
import { formatAmount } from 'helpers/formatters/format';

export function DepositForm({ close, vaultId }: { close: () => void, vaultId: BigNumber }) {
    const { depositForm$ } = useAppContext()
    const depositForm = useObservable(depositForm$(vaultId))

    const onDepositChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(e => {
        const value = e.target.value.replace(/,/g, '')

        depositForm?.change({
            kind: 'lockAmount',
            lockAmount: value === '' ? undefined : new BigNumber(value),
        })
    }, [depositForm?.change])

    const onGenerateChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(e => {
        const value = e.target.value.replace(/,/g, '')

        depositForm?.change({
            kind: 'drawAmount',
            drawAmount: value === '' ? undefined : new BigNumber(value),
        })
    }, [depositForm?.change])

    console.log({depositForm})

    if(!depositForm) {
        return null
    }

    return (
        <Modal>
            <ModalCloseIcon close={close} />
            <Grid sx={{p: 4}} variant="">
                <Box>
                    <Heading>Deposit</Heading>
                </Box>
                <Box>
                    <Label>
                        <Text>Deposit</Text>
                        <BigNumberInput
                         placeholder="0" 
                         mask={createNumberMask({
                            allowDecimal: true,
                            decimalLimit: getToken(depositForm?.vault?.token!).digits,
                            prefix: '',
                          })}
                         onChange={onDepositChange} 
                         value={(depositForm?.lockAmount || null) && formatAmount(depositForm?.lockAmount as BigNumber, depositForm?.vault?.token!)} />
                    </Label>
                    <Label>
                        <Text>Generate</Text>
                        <BigNumberInput
                         placeholder="0" 
                         mask={createNumberMask({
                            allowDecimal: true,
                            decimalLimit: getToken(depositForm?.vault?.token!).digits,
                            prefix: '',
                          })}
                         onChange={onGenerateChange} 
                         value={(depositForm?.drawAmount || null) && formatAmount(depositForm?.drawAmount as BigNumber, 'DAI')} />
                    </Label>
                </Box>
                <Box>
                    {
                        depositForm?.messages.map(message => <Box key={message}>{message}</Box>)
                    }
                </Box>
                <Box>
                    ETH balance: {depositForm.ethBalance.toString()}
                </Box>
                <Box>
                    Balance: {depositForm.balance.toString()} {depositForm.vault.token}
                </Box>
                <Button disabled={!depositForm.submit} onClick={depositForm.submit}>Deposit</Button>
            </Grid>
        </Modal>
    )
}