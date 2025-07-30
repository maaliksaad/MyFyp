import { FileStore } from '@tus/file-store'
import { Server } from '@tus/server'
import express from 'express'

const uploadApp = express()
const server = new Server({
  path: '/files',
  datastore: new FileStore({ directory: 'files' })
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
uploadApp.all('*', server.handle.bind(server))

export const tus = uploadApp
