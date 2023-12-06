import { isNum } from 'lazy-js-utils'

export function getType(obj: any): string {
  if (Array.isArray(obj)) {
    const item = obj[0]
    if (item === undefined) {
      // 空数组
      return '[]'
    }
    else if (typeof item === 'string') {
      return 'string[]'
    }
    else if (typeof item === 'object') {
      return `${getType(item)}[]`
    }
    else {
      return `unknown[]`
    }
  }
  else if (obj === null) {
    return 'null'
  }
  else if (typeof obj === 'object') {
    const record: Record<string, any> = {}
    if (!Object.keys(obj).length)
      return `Record<string, any>`

    for (const key in obj) {
      const v = obj[key]
      record[key] = getType(v)
    }
    return JSON.stringify(record)
  }
  else if (typeof obj === 'string') {
    return 'string'
  }
  else if (isNum(obj)) {
    return 'number'
  }
  else if (obj instanceof Function) {
    return 'Function'
  }
  else if (obj) {
    return obj.toString()
  }
  else {
    return 'any'
  }
}
