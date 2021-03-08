import { useTranslation, Trans } from "i18n";
import { Container } from "next/app";
import { Heading, Text, Box, Link } from "theme-ui";
import { Table, ColumnDef } from 'components/Table'
import { BorrowEvent } from "./historyEvents";



const columns: ColumnDef<BorrowEvent, {}>[] = [
    {
        headerLabel: 'event.type',
        header: ({ label }) => <Text>{label}</Text>,
        cell: ({ type }) => <Text><Trans i18nKey={`event.${type}`} /></Text>
    },
    {
        headerLabel: 'event.activity',
        header: ({ label }) => <Text>{label}</Text>,
        cell: ({ type }) => <Text>{type}</Text>
    },
    {
        headerLabel: 'event.time',
        header: ({ label }) => <Text sx={{ display: 'flex', justifyContent: 'flex-end' }}>{label}</Text>,
        cell: ({ timestamp }) => <Text sx={{ display: 'flex', justifyContent: 'flex-end' }}>{timestamp}</Text>
    },
    {
        headerLabel: '',
        header: () => null,
        cell: ({ tx }) => <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}><Link href="#" variant="secondary" >View on Etherscan</Link></Box>
    }
]

const data: BorrowEvent[] = [
    {
        id: '1',
        type: 'vault-opened',
        tx: '0x000',
        timestamp: '2021-02-09 15:18:42+00',
        owner: '0x000',
        ilk: 'ETH-A',
        collateral: 'ETH',
    },
    {
        id: '2',
        type: 'deposit',
        tx: '0x000',
        timestamp: '2021-02-09 15:18:42+00',
        amount: '1111',
        depositor: '0x000',
        ilk: 'ETH-A',
        collateral: 'ETH',
    }
]
export function HistoryTable() {
    const { t } = useTranslation()

    return (
        <Container>
            <Heading>{t('vault-history')}</Heading>
            <Table
                data={data}
                primaryKey="id"
                state={{}}
                columns={columns}
            />
        </Container>
    )
}