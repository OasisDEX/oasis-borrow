import { useLocalStorage } from './useLocalStorage'

type Onboardable = 'Exchange' // add more onboardable features here...

export function useOnboarding(feature: Onboardable): [boolean, Function] {
  const [allOnboarded, setAllOnboarded] = useLocalStorage('onboarded', {})

  const isOnboarded = !!allOnboarded[feature]
  function setAsOnboarded() {
    setAllOnboarded({ ...allOnboarded, [feature]: true })
  }

  return [isOnboarded, setAsOnboarded]
}
