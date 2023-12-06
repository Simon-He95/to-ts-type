import { getCopyText, getLocale, getSelection, message, registerCommand, updateText } from '@vscode-use/utils'
import { useJSONParse } from 'lazy-js-utils'
import { type Disposable, type ExtensionContext, Position } from 'vscode'
import { getType } from './utils'

export async function activate(context: ExtensionContext) {
  const disposes: Disposable[] = []
  const lan = getLocale()
  const isZh = lan.includes('zh')

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
    const { line, character } = getSelection()!

    updateText((edit) => {
      edit.insert(new Position(line, character), `: ${type}`)
    })

    message.info(`🎉 ${isZh ? '转换成功！' : 'Successful conversion!'}`)
  }))
  context.subscriptions.push(...disposes)
}

export function deactivate() {

}
