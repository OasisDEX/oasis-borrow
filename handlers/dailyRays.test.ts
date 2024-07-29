import { getRaysDailyChallengeData } from 'handlers/dailyRays'

describe('Rays daily challenge numbers', () => {
  it('should give 0 points and 0 streak for 0 days', () => {
    const { allBonusRays, streakRays, streaks, dailyChallengeRays } = getRaysDailyChallengeData([])
    expect(allBonusRays).toBe(0)
    expect(dailyChallengeRays).toBe(0)
    expect(streakRays).toBe(0)
    expect(streaks).toBe(0)
  })
  it('should give 100 points for 1 day', () => {
    const { allBonusRays, streakRays, streaks, dailyChallengeRays } = getRaysDailyChallengeData([
      '2001-09-11',
    ])
    expect(allBonusRays).toBe(100)
    expect(dailyChallengeRays).toBe(100)
    expect(streakRays).toBe(0)
    expect(streaks).toBe(0)
  })
  it('should give 200 points for 2 random days', () => {
    const datesArray = ['2005-04-02', '2001-09-11']

    const { allBonusRays, streakRays, streaks, dailyChallengeRays } =
      getRaysDailyChallengeData(datesArray)
    expect(allBonusRays).toBe(200)
    expect(dailyChallengeRays).toBe(200)
    expect(streakRays).toBe(0)
    expect(streaks).toBe(0)
  })
  it('should give 1000 points for 10 random days', () => {
    const datesArray = [
      '2001-09-11',
      '2001-08-12',
      '2002-11-01',
      '2002-11-15',
      '2003-03-12',
      '2003-03-17',
      '2004-07-05',
      '2004-07-05',
      '2005-04-02',
      '2005-06-22',
    ]

    const { allBonusRays, streakRays, streaks, dailyChallengeRays } =
      getRaysDailyChallengeData(datesArray)
    expect(allBonusRays).toBe(1000)
    expect(dailyChallengeRays).toBe(1000)
    expect(streakRays).toBe(0)
    expect(streaks).toBe(0)
  })
  it('should give 1000 points for 10 days with consecutive 5 days', () => {
    const datesArray = [
      '2001-09-11',
      '2001-09-12',
      '2001-09-13',
      '2001-09-14',
      '2001-09-15', // <- consevutive 5 days
      '2001-08-12',
      '2002-11-01',
      '2002-11-15',
      '2003-03-12',
      '2003-03-17',
    ]

    const { allBonusRays, streakRays, streaks, dailyChallengeRays } =
      getRaysDailyChallengeData(datesArray)
    expect(allBonusRays).toBe(1000)
    expect(dailyChallengeRays).toBe(1000)
    expect(streakRays).toBe(0)
    expect(streaks).toBe(0)
  })
  it('should give 1500 points and 1 streak for 10 days with consecutive 7 days', () => {
    const datesArray = [
      '2001-09-11',
      '2001-09-12',
      '2001-09-13',
      '2001-09-14',
      '2001-09-15',
      '2001-09-16',
      '2001-09-17', // <- consevutive 7 days
      '2001-08-12',
      '2002-11-01',
      '2002-11-15',
    ]

    const { allBonusRays, streakRays, streaks, dailyChallengeRays } =
      getRaysDailyChallengeData(datesArray)
    expect(allBonusRays).toBe(1500)
    expect(dailyChallengeRays).toBe(1000)
    expect(streakRays).toBe(500)
    expect(streaks).toBe(1)
  })
  it('should give 3600 points and 3 streak for 21 days with 3x consecutive 7 days', () => {
    const datesArray = [
      '2001-09-11',
      '2001-09-12',
      '2001-09-13',
      '2001-09-14',
      '2001-09-15',
      '2001-09-16',
      '2001-09-17', // <- consevutive 7 days
      '2002-10-11',
      '2002-10-12',
      '2002-10-13',
      '2002-10-14',
      '2002-10-15',
      '2002-10-16',
      '2002-10-17', // <- consevutive 7 days
      '2003-11-11',
      '2003-11-12',
      '2003-11-13',
      '2003-11-14',
      '2003-11-15',
      '2003-11-16',
      '2003-11-17', // <- consevutive 7 days
    ]

    const { allBonusRays, streakRays, streaks, dailyChallengeRays } =
      getRaysDailyChallengeData(datesArray)
    expect(allBonusRays).toBe(3600)
    expect(dailyChallengeRays).toBe(2100)
    expect(streakRays).toBe(1500)
    expect(streaks).toBe(3)
  })
  it('should give 4000 points and 3 streak for 21 days with 3x consecutive 7 days and 4 random dates', () => {
    const datesArray = [
      '2001-09-11',
      '2001-09-12',
      '2001-09-13',
      '2001-09-14',
      '2001-09-15',
      '2001-09-16',
      '2001-09-17', // <- consevutive 7 days
      '2002-10-11',
      '2002-10-12',
      '2002-10-13',
      '2002-10-14',
      '2002-10-15',
      '2002-10-16',
      '2002-10-17', // <- consevutive 7 days
      '2003-11-11',
      '2003-11-12',
      '2003-11-13',
      '2003-11-14',
      '2003-11-15',
      '2003-11-16',
      '2003-11-17', // <- consevutive 7 days
      '2003-12-13',
      '2003-12-15',
      '2003-12-17',
      '2003-12-19',
    ]

    const { allBonusRays, streakRays, streaks, dailyChallengeRays } =
      getRaysDailyChallengeData(datesArray)
    expect(allBonusRays).toBe(4000)
    expect(dailyChallengeRays).toBe(2500)
    expect(streakRays).toBe(1500)
    expect(streaks).toBe(3)
  })
})
