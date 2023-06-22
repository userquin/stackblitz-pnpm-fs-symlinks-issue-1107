import { readFile } from 'node:fs/promises'
import type { Plugin } from 'vite'
import fg from 'fast-glob'

export function ClientPlugin() {
  return <Plugin>{
    name: 'vite-client-plugin',
    configureServer(server) {
      const filesPromise = readDirectory(server.config.root)
      server.middlewares.use('/read-files', async (_req, res) => {
        const files = await filesPromise
        res.setHeader('Content-Type', 'application/json')
        res.write(JSON.stringify(files), 'utf-8')
        res.end()
      })
    },
  }
}

interface FileSystemProjectTree {
  [name: string]: DirectoryProjectNode | FileProjectNode
}

interface DirectoryProjectNode {
  directory: FileSystemProjectTree
}

interface FileProjectNode {
  file: {
    /**
         * The contents of the file, either as a UTF-8 string or as raw binary.
         */
    contents: string
  }
}

async function readDirectory(
  cwd: string,
  ignore = ['node_modules', 'pnpm-lock.yaml', 'plugins', 'vite.config.ts'],
) {
  const files = await fg('**', {
    cwd,
    deep: 1,
    ignore,
    absolute: false,
    onlyFiles: false,
    onlyDirectories: false,
    dot: false,
    stats: true,
  })

  const root: FileSystemProjectTree = {}

  await Promise.all(files.map(async (file) => {
    if (file.stats!.isDirectory()) {
      root[file.name.replace(/\/\/$/, '/')] = {
        directory: await readDirectory(`${cwd}/${file.name}`, ignore),
      }
    }
    else {
      root[file.name] = {
        file: { contents: await readFile(`${cwd}/${file.name}`, 'utf-8') },
      }
    }
  }))

  return root
}
