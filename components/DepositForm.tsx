import { Modal, ModalCloseIcon, } from './Modal'
import { Container, Input, Text, Label, Heading, Button, Box, Grid } from 'theme-ui';
import { useAppContext } from './AppContextProvider';
import { useObservable } from 'helpers/observableHook';
import { BigNumberInput } from 'helpers/BigNumberInput'
import { useCallback, useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { createNumberMask } from 'text-mask-addons';
import { getToken } from './blockchain/config';
import { formatAmount } from 'helpers/formatters/format';

export function DepositForm({ close, vaultId }: { close: () => void, vaultId: BigNumber }) {
    const { depositForm$ } = useAppContext()
    const depositForm = useObservable(depositForm$(vaultId))

    const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(e => {
        const value = e.target.value.replace(/,/g, '')

        depositForm?.change({
            kind: 'depositAmount',
            depositAmount: value === '' ? undefined : new BigNumber(value),
        })
    }, [depositForm?.change])

    console.log({depositForm})

    if(!depositForm) {
        return null
    }

    return (
        <Modal>
            <ModalCloseIcon close={close} />
            <Grid variant="">
                <Box>
                    <Heading>Deposit</Heading>
                </Box>
                <Box>
                    <Label>
                        <Text>Amount</Text>
                        <BigNumberInput
                         placeholder="0" 
                         mask={createNumberMask({
                            allowDecimal: true,
                            decimalLimit: getToken(depositForm?.vault?.token!).digits,
                            prefix: '',
                          })}
                         onChange={onChange} 
                         value={(depositForm?.depositAmount || null) && formatAmount(depositForm?.depositAmount as BigNumber, depositForm?.vault?.token!)} />
                    </Label>
                </Box>
                <Box>
                    {
                        depositForm?.messages.map(message => <Box key={message}>{message}</Box>)
                    }
                </Box>
                <Box>
                    Balance: {depositForm?.balance.toString()} {depositForm?.vault.token}
                </Box>
                <Button onClick={depositForm?.submit}>Deposit</Button>
            </Grid>
        </Modal>
    )
}