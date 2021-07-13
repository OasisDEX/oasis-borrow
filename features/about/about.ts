import fs from 'fs'
import { join } from 'path'

export function getTeamPicsFileNames() {
  return fs.readdirSync(join(process.cwd(), 'public/static/img/team'))
}

export interface TeamMember {
  name: string
  order: string
  title: string
  picFileName: string
}

export function parseMemberInfo(fileName: string): TeamMember {
  const nameWithoutExt = fileName.split('.').slice(0, -1).join('.')
  const memberNameAndTitle = nameWithoutExt.split('_')
  if (memberNameAndTitle.length > 2) {
    throw new Error(`Team pic file name has more than one underscore: ${fileName}`)
  }
  if (memberNameAndTitle.length < 2) {
    throw new Error(
      `Team pic file name doesn't have an underscore separating name and title: ${fileName}`,
    )
  }
  const [memberName, title] = memberNameAndTitle.map((str) => str.trim())
  const memberNameNoDigits = memberName.replace(/[0-9]/g, '')
  return {
    name: memberNameNoDigits,
    order: memberName,
    title: title,
    picFileName: fileName,
  }
}
