import { isNum } from 'lazy-js-utils'

function isValidIdentifier(key: string): boolean {
  return /^[$A-Z_][\w$]*$/i.test(key)
}

function formatObjectKey(key: string): string {
  return isValidIdentifier(key) ? key : JSON.stringify(key)
}

export function getType(obj: unknown): string {
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      // 空数组：推不出来元素类型
      return 'unknown[]'
    }

    const elementTypes = [...new Set(obj.map(item => getType(item)))]
    return elementTypes.length === 1
      ? `${elementTypes[0]}[]`
      : `(${elementTypes.join(' | ')})[]`
  }

  if (obj === null)
    return 'null'

  if (typeof obj === 'string')
    return 'string'

  if (isNum(obj))
    return 'number'

  if (typeof obj === 'boolean')
    return 'boolean'

  if (typeof obj === 'bigint')
    return 'bigint'

  if (typeof obj === 'symbol')
    return 'symbol'

  if (typeof obj === 'undefined')
    return 'undefined'

  if (typeof obj === 'function')
    return 'Function'

  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>)
    if (entries.length === 0)
      return 'object'

    const record: Record<string, string> = {}
    for (const [key, value] of entries) {
      if (value === 'null') {
        // 根据一些常用名推断一下，否则返回 unknown
        record[key] = /phone|name|desc|address|src|label|type/i.test(key) ? 'string' : 'unknown'
        continue
      }
      record[key] = getType(value)
    }

    return `${Object.keys(record).reduce((result, key) => {
      result += `${formatObjectKey(key)}: ${record[key]}; `
      return result
    }, '{ ')}}`
  }

  return 'unknown'
}

export function getBeforeFirstNotSpaceChar(text: string, character: number): [string, number] {
  for (let i = character - 1; i >= 0; i--) {
    if (text[i] && !/\s/.test(text[i]))
      return [text[i], i]
  }
  return ['', character]
}

function unwrapOnce(text: string): string {
  if (!(text.startsWith('(') && text.endsWith(')')))
    return text

  let depth = 0
  let inString: '"' | '\'' | null = null
  let escaped = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inString) {
      if (escaped) {
        escaped = false
        continue
      }
      if (ch === '\\') {
        escaped = true
        continue
      }
      if (ch === inString)
        inString = null
      continue
    }

    if (ch === '"' || ch === '\'') {
      inString = ch
      continue
    }

    if (ch === '(') {
      depth++
    }
    else if (ch === ')') {
      depth--
      if (depth === 0 && i !== text.length - 1)
        return text
    }
  }

  return text.slice(1, -1).trim()
}

function unwrapParens(text: string): string {
  let next = text.trim()
  while (true) {
    const unwrapped = unwrapOnce(next)
    if (unwrapped === next)
      return next
    next = unwrapped
  }
}

export function stripJsonComments(text: string): string {
  let result = ''
  let inString: '"' | '\'' | null = null
  let escaped = false
  let inLineComment = false
  let inBlockComment = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]

    if (inLineComment) {
      if (ch === '\n') {
        inLineComment = false
        result += ch
      }
      continue
    }

    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false
        i++
      }
      continue
    }

    if (inString) {
      result += ch
      if (escaped) {
        escaped = false
        continue
      }
      if (ch === '\\') {
        escaped = true
        continue
      }
      if (ch === inString)
        inString = null
      continue
    }

    if (ch === '"' || ch === '\'') {
      inString = ch
      result += ch
      continue
    }

    if (ch === '/' && next === '/') {
      inLineComment = true
      i++
      continue
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true
      i++
      continue
    }

    result += ch
  }

  return result
}

function parseStringLiteral(input: string, start: number): { value: string, index: number } | undefined {
  const quote = input[start]
  if (quote !== '"' && quote !== '\'')
    return undefined

  let out = ''
  let i = start + 1
  for (; i < input.length; i++) {
    const ch = input[i]
    if (ch === quote)
      return { value: out, index: i + 1 }
    if (ch !== '\\') {
      out += ch
      continue
    }

    const esc = input[i + 1]
    if (esc === undefined)
      return undefined
    i++
    switch (esc) {
      case 'n': out += '\n'
        break
      case 'r': out += '\r'
        break
      case 't': out += '\t'
        break
      case 'b': out += '\b'
        break
      case 'f': out += '\f'
        break
      case '\\': out += '\\'
        break
      case '"': out += '"'
        break
      case '\'': out += '\''
        break
      case 'u': {
        const hex = input.slice(i + 1, i + 5)
        if (!/^[0-9a-f]{4}$/i.test(hex))
          return undefined
        out += String.fromCharCode(Number.parseInt(hex, 16))
        i += 4
        break
      }
      default:
        out += esc
    }
  }
  return undefined
}

function skipWs(input: string, index: number): number {
  while (index < input.length && /\s/.test(input[index]))
    index++
  return index
}

function parseIdentifier(input: string, start: number): { value: string, index: number } | undefined {
  const first = input[start]
  if (!first || !/[$A-Z_]/i.test(first))
    return undefined
  let i = start + 1
  while (i < input.length && /[$\w]/.test(input[i]))
    i++
  return { value: input.slice(start, i), index: i }
}

function parseNumberLiteral(input: string, start: number): { value: number, index: number } | undefined {
  const m = input.slice(start).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:e[+-]?\d+)?/i)
  if (!m)
    return undefined
  const raw = m[0]
  const num = Number(raw)
  if (Number.isNaN(num))
    return undefined
  return { value: num, index: start + raw.length }
}

function parseValue(input: string, start: number): { value: unknown, index: number } | undefined {
  let i = skipWs(input, start)
  const ch = input[i]
  if (!ch)
    return undefined

  if (ch === '{') {
    i++
    const obj: Record<string, unknown> = {}
    i = skipWs(input, i)
    if (input[i] === '}')
      return { value: obj, index: i + 1 }

    while (i < input.length) {
      i = skipWs(input, i)
      let key: string | undefined
      const strKey = parseStringLiteral(input, i)
      if (strKey) {
        key = strKey.value
        i = strKey.index
      }
      else {
        const idKey = parseIdentifier(input, i)
        if (!idKey)
          return undefined
        key = idKey.value
        i = idKey.index
      }

      i = skipWs(input, i)
      if (input[i] !== ':')
        return undefined
      i++

      const parsed = parseValue(input, i)
      if (!parsed)
        return undefined
      obj[key] = parsed.value
      i = skipWs(input, parsed.index)

      if (input[i] === ',') {
        i++
        i = skipWs(input, i)
        if (input[i] === '}')
          return { value: obj, index: i + 1 }
        continue
      }
      if (input[i] === '}')
        return { value: obj, index: i + 1 }
      return undefined
    }
    return undefined
  }

  if (ch === '[') {
    i++
    const arr: unknown[] = []
    i = skipWs(input, i)
    if (input[i] === ']')
      return { value: arr, index: i + 1 }

    while (i < input.length) {
      const parsed = parseValue(input, i)
      if (!parsed)
        return undefined
      arr.push(parsed.value)
      i = skipWs(input, parsed.index)

      if (input[i] === ',') {
        i++
        i = skipWs(input, i)
        if (input[i] === ']')
          return { value: arr, index: i + 1 }
        continue
      }
      if (input[i] === ']')
        return { value: arr, index: i + 1 }
      return undefined
    }
    return undefined
  }

  const str = parseStringLiteral(input, i)
  if (str)
    return { value: str.value, index: str.index }

  const num = parseNumberLiteral(input, i)
  if (num)
    return { value: num.value, index: num.index }

  if (input.startsWith('true', i))
    return { value: true, index: i + 4 }
  if (input.startsWith('false', i))
    return { value: false, index: i + 5 }
  if (input.startsWith('null', i))
    return { value: null, index: i + 4 }
  if (input.startsWith('undefined', i))
    return { value: undefined, index: i + 9 }

  return undefined
}

export function parseClipboardData(text: string): unknown | undefined {
  const trimmed = text.trim()
  if (!trimmed)
    return undefined

  let candidate = trimmed
  candidate = candidate.replace(/^export\s+default\s+/, '')
  candidate = candidate.replace(/^return\s+/, '')
  candidate = candidate.replace(/^(?:const|let|var)\s+[$\w]+\s*=\s*/i, '')
  candidate = candidate.replace(/;+\s*$/, '')
  candidate = unwrapParens(candidate)

  const noComments = stripJsonComments(candidate).trim()
  try {
    return JSON.parse(noComments)
  }
  catch {}

  const parsed = parseValue(noComments, 0)
  if (!parsed)
    return undefined
  const end = skipWs(noComments, parsed.index)
  if (end !== noComments.length)
    return undefined
  return parsed.value
}
