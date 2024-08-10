import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import { readdir } from 'node:fs/promises'
import SwaggerParser from 'swagger-parser'
import swaggerUi from 'swagger-ui-express'
import assert from 'assert'
import express from 'express'
import merge from 'lodash.merge'

const router = express.Router()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const resourcesDir = path.resolve(__dirname, '..', 'resources')

router.use('/explorer', swaggerUi.serve)

fs.watch(resourcesDir, async (_, filename) => {
  if (isJsonFile(filename)) {
    await extractData(filename)
  }
})

function isJsonFile (filename) {
  return /\.json$/i.test(filename)
}

async function extractData (filename) {
  console.log('reading file: ', { date: new Date(), filename })
  // eslint-disable-next-line
  const regex = /[\W!@#\$%\^\&*\)\(+=._-]+/ig
  try {
    const dereffDoc = await SwaggerParser.dereference(path.resolve(resourcesDir, filename))
    mockRoutes(dereffDoc, `${dereffDoc.info.title.replace(regex, '')}_${dereffDoc.info.version.replace(regex, '')}`, filename)
  } catch (ex) {
    console.error('error reading file: ', { date: new Date(), error: ex })
  }
}

function getParamExample (parameters) {
  const request = {}
  parameters && parameters.forEach((param) => {
    param?.examples && Object.entries(param.examples).forEach(([key, val]) => {
      request[key] = request[key] ?? {}
      request[key][param.name] = val.value
    })
  })
  return request
}

function getReqBodyExample (content) {
  const request = {}
  content && Object.values(content).forEach(({ examples }) => {
    examples && Object.entries(examples).forEach(([key, val]) => {
      request[key] = request[key] ?? {}
      request[key] = { ...request[key], ...val?.value }
    })
  })
  return request
}

function getResBodyExample (responses) {
  const responseExample = {}
  const status = {}
  responses && Object.entries(responses).forEach(([statusCode, { content }]) => {
    content && Object.entries(content).forEach(([contentType, { examples }]) => {
      if (/json/.test(contentType)) {
        examples && Object.entries(examples).forEach(([key, val]) => {
          responseExample[key] = val?.value
          status[key] = Number(statusCode) || 200
        })
      }
    })
  })
  return { responses: responseExample, status }
}

function getReqestContent (parameters, req) {
  const requestParams = { ...req.body }
  parameters.forEach((param) => {
    if (param.in === 'path') {
      requestParams[param.name] = req.params[param.name]
    } else if (param.in === 'query') {
      requestParams[param.name] = req.query[param.name]
    } else if (param.in === 'header') {
      requestParams[param.name] = req.headers[param.name.toLowerCase()]
    } else if (param.in === 'cookie') {
      requestParams[param.name] = req.cookies[param.name]
    }
  })
  return requestParams
}

// Function to mock routes based on OpenAPI doc
function mockRoutes (api, prefix, filename) {
  const paths = api.paths
  // override the server
  api.servers = [{ url: `/${prefix}` }]
  // serve openapi doc
  router.get(`/doc/${filename}`, (_, res) => res.send(api))
  Object.keys(paths).forEach((route) => {
    const pathItem = paths[route]
    const methods = ['get', 'post', 'put', 'delete', 'patch']
    methods.forEach((method) => {
      if (pathItem[method]) {
        const operation = pathItem[method]
        const responses = operation.responses
        const parameters = operation.parameters || []
        const requestContent = operation?.requestBody?.content
        const examples = { request: merge(getParamExample(parameters), getReqBodyExample(requestContent)), ...getResBodyExample(responses) }
        router[method](`/${prefix}${route.replace(/{/g, ':').replace(/}/g, '')}`, (req, res) => {
          const transaction = new Date().getTime()
          console.log('request in: ', { date: new Date(), path: req.url, doc: filename, transaction })
          const requestParams = getReqestContent(parameters, req)
          let responseExample = Object.values(examples.responses)?.[0]; let responseStatus = Object.values(examples.status)?.[0]
          Object.entries(examples.request).some(([key, reqExample]) => {
            try {
              if (assert.deepEqual(reqExample, requestParams) === undefined) {
                responseExample = examples.responses[key]
                responseStatus = examples.status[key]
                return true
              }
              return false
            } catch (e) {
              return false
            }
          })
          res.status(responseStatus || 200).json(responseExample || {})
          console.log('response out: ', { date: new Date(), transaction, status: responseStatus || 200 })
        })
      }
    })
  })
}

async function getAllFiles () {
  const files = []
  const options = {
    explorer: true,
    swaggerOptions: {
      urls: []
    }
  }
  // Read the contents of the directory
  const entries = await readdir(resourcesDir, { withFileTypes: true })
  for (const entry of entries) {
    if (isJsonFile(entry.name)) {
      files.push(entry.name)
      extractData(entry.name)
      options.swaggerOptions.urls.push({
        url: `/doc/${entry.name}`,
        name: entry.name
      })
    }
  }
  router.get('/explorer', swaggerUi.setup(null, options))
  return files
}

export {
  getAllFiles,
  router
}
