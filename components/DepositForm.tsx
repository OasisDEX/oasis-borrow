import { Modal, ModalCloseIcon, } from './Modal'
import { Container, Input, Text, Label, Heading, Button } from 'theme-ui';
import { useAppContext } from './AppContextProvider';
import { useObservable } from 'helpers/observableHook';
import { useCallback } from 'react';

export function DepositForm({ close }: { close: () => void }) {
    const { depositForm$ } = useAppContext()
    const depositForm = useObservable(depositForm$)

    const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(e => {
        depositForm?.change({
            kind: 'amount',
            amount: Number(e.target.value)
        })
    }, [depositForm?.change])

    return (
        <Modal>
            <ModalCloseIcon close={close} />
            <Container>
                <Heading>Deposit</Heading>
                <Label>
                    <Text>
                        Amount 
                    </Text>
                    <Input type="number" placeholder="0" onChange={onChange} value={depositForm?.amount || undefined} />
                </Label>
                <Button onClick={depositForm?.submit}>Deposit</Button>
            </Container>
        </Modal>
    )
}