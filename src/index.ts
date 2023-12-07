import { nextTick } from 'node:process'
import { getCopyText, getSelection, registerCommand, setSelection, updateText } from '@vscode-use/utils'
import { useJSONParse } from 'lazy-js-utils'
import { type Disposable, type ExtensionContext, Position } from 'vscode'
import { getType } from './utils'

export async function activate(context: ExtensionContext) {
  const disposes: Disposable[] = []
  disposes.push(registerCommand('to-ts-type.transform', async () => {
    const text = await getCopyText()
    if (!text)
      return
    // text 需要过滤 一些注释比如// 或者 /** */
    const filteredText = text.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '').replace(/'/g, '"').trim()
    const obj = useJSONParse(filteredText)

    if (!obj)
      return

    const type = getType(obj) || getType(text)
    const { line, character, lineText } = getSelection()!
    const beforeChar = getBeforeFirstNotSpaceChar(lineText, character)

    let insertText = ''
    if (beforeChar === '(') {
      insertText = `<${type}>`
    }
    else if (beforeChar === ':') {
      insertText = type
    }
    else if (beforeChar) {
      insertText = `: ${type}`
    }
    else {
      insertText = `type IType = ${type}`
      nextTick(() => {
        setSelection([line, character + 'type '.length], [line, character + 'type IType'.length])
      })
    }
    updateText((edit) => {
      edit.insert(new Position(line, character), insertText)
    })
  }))
  context.subscriptions.push(...disposes)
}

export function deactivate() {

}

function getBeforeFirstNotSpaceChar(text: string, character: number) {
  for (let i = character; i >= 0; i--) {
    if (text[i] !== ' ')
      return text[i]
  }
  return ''
}
