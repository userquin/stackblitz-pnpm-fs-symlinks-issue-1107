import type { FileSystemTree, WebContainerProcess } from '@webcontainer/api'
import { WebContainer } from '@webcontainer/api'

import { FitAddon } from 'xterm-addon-fit'
import { Terminal } from 'xterm'

let webContainerInstance: WebContainer | undefined
let shellProcess: WebContainerProcess | undefined
let fitAddon: FitAddon
let terminal: Terminal

export async function load(terminalContainer: HTMLElement) {
  if (webContainerInstance)
    return webContainerInstance

  const files: FileSystemTree = await fetch('/read-files').then(res => res.json())

  fitAddon = new FitAddon()
  terminal = new Terminal({
    convertEol: true,
  })
  terminal.loadAddon(fitAddon)

  terminal.open(terminalContainer)
  fitAddon.fit()

  webContainerInstance = await WebContainer.boot()
  await webContainerInstance.mount(files)

  shellProcess = await webContainerInstance.spawn('jsh', {
    terminal: {
      cols: terminal.cols,
      rows: terminal.rows,
    },
  })
  shellProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        terminal.write(data)
      },
    }),
  )

  const input = shellProcess.input.getWriter()

  terminal.onData((data) => {
    input.write(data)
  })

  return webContainerInstance
}

export async function installDependencies() {
  if (!webContainerInstance)
    return

  const shellProcess = await webContainerInstance.spawn('pnpm', ['install'])
  shellProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        terminal.write(data)
      },
      close() {
        terminal.writeln('\n')
      },
    }),
  )

  const installExitCode = await shellProcess.exit

  if (installExitCode !== 0)
    throw new Error(`Unable to run "pnpm install": ${installExitCode}`)
}
