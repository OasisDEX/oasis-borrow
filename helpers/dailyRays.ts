import dayjs from 'dayjs'

export const dailyRaysAmount = 10
export const bonusRaysAmount = 30

export const getRaysDailyChallengeDateFormat = () => dayjs().format('YYYY-MM-DD')
const s1Cutoff = dayjs('2025-01-24').subtract(1, 'day') // because its a full day

export const explodeRays = (smallExplosion: boolean) => {
  const iconsCount = smallExplosion ? 10 : 70
  // needs claim-rays container
  // currently positioned only for portfolio
  const raysContainer = document.getElementById('claim-rays')
  if (raysContainer) {
    for (let i = 0; i < iconsCount; i++) {
      // eslint-disable-next-line sonarjs/no-identical-expressions
      const translateX = Math.random() * 200 - Math.random() * 200
      // eslint-disable-next-line sonarjs/no-identical-expressions
      const translateY = Math.random() * 200 - Math.random() * 200
      const raysIcon = document.createElement('div')
      raysIcon.style.position = 'absolute'
      raysIcon.style.zIndex = `${1000 + iconsCount}`
      raysIcon.style.pointerEvents = 'none'
      raysIcon.style.width = `${Math.random() * 20 + 10}px`
      raysIcon.style.height = `${Math.random() * 20 + 10}px`
      raysIcon.style.backgroundImage =
        "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAABBdJREFUSEudlv1rW1UYx7/n9d4kA+2qzNEWO2ZXwl4Yzvk+eyOlFpnUgbXOl+0HQfQHZdjBulWX3EHH/Bf8RQuiCP40AqX4Q1MrVhCdULcWN6tuma107TbXJM3bPXJOcrP0JQq5EC45yX0+z3m+3+c8l2DjiwCgABQAb6O/qGtTjl4nLbsTNWKYZR1oo4tPH2x+OhxPfg8gtxGkcHlSEcpdtn1/rB6AvHKoNcsYd7d9deXcWkj2wkgMlEcp567YGakPMPvS9lHGmMMZd5s+v/QRgAKAYmriy9OE8ShhDISxhP3IC5G6dnC1r32UagDnoIyBMeamul/joWBokEsJShkI54lNzxyuD5A8HB5lnDuM6+AclHOotj0gXCDbsgNccL0DND7/tlVjB9ocxVoiy7kje04xRqOV4EJCcQHoe8P9IPdsBrhAMbM8rAr5P5QUHRA2mLRBpO0wS0Yaek9O1AT8/c5TH7PcylGmM+cSSojyR4MkIAQ8IQ1ECQkiLR24DLDcxr6Txhxk4YMXHXDueISCUNrhMYaCB8f6Zwn89pJ52M880H0EuaszyCV/XbUOaYFKG7QEqQTX9iYLA90OIXxMUQpQBn3PKwI7fQckk1oVqPHseeT/vISbX5yrrPuZ+4DGV04FAWT93qmUaPF4V0xRFi0SgpwCQtkMlP61vINA1xsIOi8bPVOT57H8wwgg7mZOLV17y2041D8EIO8Lv0qDxWPPxvIKUaGU6XFdGt6+D8HOVyG27VpnltRPXyPzy4Qpj0ovY2l+fmjH4Cenqzt/rch09s1Hz9wbsgeVfohLBLpeRzDSty54fm4W6alxFG/OgQob3q0byMxfg+Dc3XLi00p3rwWIxfecQSVE1C+NEVkIhDp6EXqyp1Qik/k3INqWlg1kV7B88UcIKUwDKsrcLYOfGUg1QJ+e1mJ/V1oH1ADP9722KJdo6O2HbGrDjeEPoWteEtaGuj6L1G8zELr5qsxCGIv4AB1cLr7fOaCEjBrPV7x/16ZW605YLe3IXPyuDNAiB6B+n0Z65mdYQiQ8QkAYH/cMiCb8c78qeFXHmuYqffezLbnFz77kIty5Pbyp5923yqfuKr00gC0c7zxAmBhTXCZMeUx3WuPFlZVWb/nWUX0Osfu2gj3QUmkonbnuAVMqYbuBx3rO1gIYSHmCrXPLdM+DWV1XDwSb9+4HYQKBfQdMYC1y2f8Je2/3c7UA/3WcY/pg8xihxAHRMgEZD0MPHYsVqAxEK6USVkLuitQLaBoDYOYvoNxw/K8z5R3z7IWREyWQleBtT9QLaI4BKgoQNxxPVo9H47z85ckBKqwoa31YzwU9v9eJ/H8lcgA1Fo5f3+hoNxA1N/U42br72/JYrQcAhOPJWq8nGqLheoLp15xV179XQl0rXqQ6IgAAAABJRU5ErkJggg==')"
      raysIcon.style.backgroundSize = 'contain'
      raysIcon.style.backgroundRepeat = 'no-repeat'
      raysIcon.style.backgroundPosition = 'center'
      raysIcon.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out'
      raysContainer.appendChild(raysIcon)
      setTimeout(() => {
        setTimeout(() => {
          raysIcon.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${Math.random() * 400}deg)`
        }, 1)
        setTimeout(() => {
          raysIcon.style.opacity = '0'
        }, Math.random() * 150)
        setTimeout(() => {
          raysIcon.remove()
        }, 1000)
      }, Math.random() * 150)
    }
  }
}

// this function is also used in monorepo -> rays-dashboard, if you make changes here you should also update it there
// skipCutoff is used for testing purposes only
export const getRaysDailyChallengeData = (claimedDates?: string[], skipCutoff?: boolean) => {
  if (!claimedDates) {
    return {
      dailyChallengeRays: 0,
      streakRays: 0,
      allBonusRays: 0,
      currentStreak: 0,
      streaks: 0,
    }
  }
  // season 1 cutoff
  const claimedDatesFiltered = claimedDates.filter((date) =>
    skipCutoff ? true : dayjs(date).isAfter(s1Cutoff),
  )
  // every day the user claims the daily challenge, they get 100 points
  // every 7 consecutive days, the user gets a 500 points bonus
  const dailyChallengeRays = claimedDatesFiltered.length * dailyRaysAmount

  const consecutiveDaysMap = claimedDatesFiltered
    .sort((a, b) => {
      return dayjs(a).isBefore(dayjs(b)) ? -1 : 1
    })
    .reduce((acc, date, index, array) => {
      // if it is the first date, we will always have a streak of 1
      if (index === 0) {
        return acc.set(date, 1)
      }
      // if the difference between the current date and the previous date is 1 day
      // we will increment the streak by 1
      if (dayjs(date).diff(dayjs(array[index - 1]), 'day') === 1) {
        if (acc.get(array[index - 1]) === 7) {
          // if the previous streak was 7, we will not increment the streak
          return acc.set(date, 1)
        }
        return acc.set(date, (acc.get(array[index - 1]) || 0) + 1)
      }
      // if the difference between the current date and the previous date is not 1 day
      // we will start a new streak of 1
      return acc.set(date, 1)
    }, new Map<string, number>())

  // all we need is to filter the values that are equal to 7
  const streaks = Array.from(consecutiveDaysMap.values()).filter((streak) => streak === 7).length

  // and we can reuse the consecutiveDaysMap for the current streak
  // returning the last value of the map for today or yesterday (the case if not claimed today)
  const currentStreak =
    consecutiveDaysMap.get(getRaysDailyChallengeDateFormat()) ||
    consecutiveDaysMap.get(
      dayjs(getRaysDailyChallengeDateFormat()).subtract(1, 'day').format('YYYY-MM-DD'),
    ) ||
    0

  const streakRays = streaks * bonusRaysAmount

  return {
    dailyChallengeRays,
    streakRays: streakRays,
    allBonusRays: dailyChallengeRays + streakRays,
    currentStreak,
    streaks,
  }
}
