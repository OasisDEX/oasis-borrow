import { useTranslation, Trans } from "i18n";
import { Container } from "next/app";
import { Heading, Text, Box, Link } from "theme-ui";
import { Table, ColumnDef } from 'components/Table'
import { BorrowEvent_ } from "./historyEvents";
import { useAppContext } from "components/AppContextProvider";
import { useObservable } from "helpers/observableHook";
import { useMemo } from "react";

interface ColumnData extends BorrowEvent_ {
    etherscan: {
        url: string;
        apiUrl: string;
        apiKey: string;
    } | undefined
}

const columns: ColumnDef<ColumnData, {}>[] = [
    {
        headerLabel: 'event.activity',
        header: ({ label }) => <Text>{label}</Text>,
        cell: ({ kind }) => <Text>{kind}</Text>
    },
    {
        headerLabel: 'event.time',
        header: ({ label }) => <Text sx={{ display: 'flex', justifyContent: 'flex-end' }}>{label}</Text>,
        cell: ({ timestamp }) => <Text sx={{ display: 'flex', justifyContent: 'flex-end' }}>{timestamp}</Text>
    },
    {
        headerLabel: '',
        header: () => null,
        cell: ({ hash, etherscan }) => {
            const { t } = useTranslation()

            return (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Link
                        variant="secondary"
                        href={`${etherscan?.url}/tx/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t('view-on-etherscan')} -{'>'}
                    </Link>
                </Box>
            )
        }
    }
]
export function HistoryTable({ id }: { id: string }) {
    const { vaultHistory$, context$ } = useAppContext()
    const { t } = useTranslation()

    const history = useObservable(vaultHistory$(id))
    const context = useObservable(context$)
    const historyWithEtherscan = useMemo(() => history && history.map(el => ({ ...el, etherscan: context?.etherscan })), [history, context?.etherscan])

    if (historyWithEtherscan === undefined) {
        return null
    }


    return (
        <Container>
            <Heading>{t('vault-history')}</Heading>
            <Table
                data={historyWithEtherscan}
                primaryKey="id"
                state={{}}
                columns={columns}
            />
        </Container>
    )
}