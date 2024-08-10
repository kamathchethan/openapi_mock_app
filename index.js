import express from 'express'
import { getAllFiles, router } from './src/util.js'
import cookieParser from 'cookie-parser'
const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(router)
app.listen(8080, async () => {
  await getAllFiles()
  console.log(`Mock server running at http://localhost:${8080}/explorer`)
})
