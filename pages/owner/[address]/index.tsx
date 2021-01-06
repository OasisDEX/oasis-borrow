import { isAppContextAvailable, useAppContext } from 'components/AppContextProvider';
import { BasicLayout } from 'components/Layouts';
import { useObservable } from 'helpers/observableHook';
import { Grid } from 'theme-ui'

function OverviewPage() {

    const { web3Context$ } = useAppContext()
    const web3Context = useObservable(web3Context$)


    return <Grid>Connected Address :: {web3Context?.account}</Grid>;

}

export default function Overview() {
    return isAppContextAvailable() ? <OverviewPage /> : null
}

OverviewPage.layout = BasicLayout
OverviewPage.layoutProps = {
    backLink: {
        href: '/',
    },
}

