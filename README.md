# @webcontainer/api filesystem repro - Issue 1107

This is the reproduction for issue 1107: https://github.com/stackblitz/webcontainer-core/issues/1107.

This repo when starting the `dev server`, it will download the project itself and mount it using `@webcontainer/api`.

Check [vite client plugin](./plugins/client.ts) and [setup container module](./src/setup-container.ts) for more details.

## The problem

When listing `node_modules`, the packages are there, but if we try to list their content, the children are missing when listing `symlinks`.

## The reproduction

This reproduction will list `node_modules/vite` folder when clicking `List Node Modules` button.

The [fs.readdir](./src/main.ts#L15) call will not return nor follow symlinks, steps to reproduce it:
1) Run `pnpm install` in the terminal once the dev server is started.
2) Run `ls -l node_modules`, you'll see the packages (some with symlinks created by PNPM) and `.pnpm` folder.
3) Run `ls -l node_modules/vite`, you won't see any file.
4) Click `List Vite Folder` button.
5) You won't get any file when `fs.readdir('/node_modules/vite', { withFileTypes: true })` is called.</pre>.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/userquin/webcontainer-fs-symlink-repro)
