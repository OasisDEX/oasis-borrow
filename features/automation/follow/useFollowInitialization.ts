import { useAppContext } from "components/AppContextProvider"
import { FOLLOWED_VAULTS_LIMIT_REACHED_CHANGE } from "features/automation/follow/followedVaultsLimitReached"
import { useEffect } from "react"

export function useFollowInitialization({
    isLimitReached,
}: {
    isLimitReached: boolean
}) {
    console.log("useFollowInitialization")
    const { uiChanges } = useAppContext()
    useEffect(() => {
        uiChanges.publish(FOLLOWED_VAULTS_LIMIT_REACHED_CHANGE, {
            type: 'followed-vaults-limit-reached-change',
            isLimitReached,
        })
    }, [isLimitReached])
    console.log("useFollowInitialization", isLimitReached)
    return isLimitReached
}