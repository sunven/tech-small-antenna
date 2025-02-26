import { execSync } from 'child_process'
import { format } from 'date-fns'

export function remarkModifiedTime() {
  return function (tree, file) {
    const filepath = file.history[0]
    const result = execSync(`git log -1 --pretty="format:%cI" "${filepath}"`)
    const resultStr = result.toString()
    file.data.astro.frontmatter.lastModified = resultStr ? format(resultStr, 'yyyy-MM-dd') : ''
  }
}
