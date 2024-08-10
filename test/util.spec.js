import request from 'supertest'
import express from 'express'
import { getAllFiles, router } from '../src/util.js'
import assert from 'assert'
const app = express()
app.use(express.json())
app.use(router)

describe('mock openapi test', () => {
  before(async () => {
    await getAllFiles()
  })

  describe('GET /explorer', function () {
    it('return all openapi doc in html', async function () {
      await request(app).get('/explorer').expect(301)
    })
  })

  describe('PUT /pet', function () {
    const payload = {
      id: 1,
      name: 'Max',
      category: {
        id: 1,
        name: 'Dogs'
      },
      photoUrls: [
        'http://example.com/photo1.jpg'
      ],
      tags: [
        {
          id: 1,
          name: 'tag1'
        }
      ],
      status: 'available'
    }

    it('return example-1 when valid payload is sent', async function () {
      const response = await request(app).put('/SwaggerPetstoreOpenAPI30_1019/pet').send(payload).expect(200)
      assert.deepStrictEqual(response.body, payload)
    })

    it('return empty when invalid payload is sent', async function () {
      const response = await request(app).put('/SwaggerPetstoreOpenAPI30_1019/pet').send({ ...payload, id: 2 }).expect(200)
      assert.deepStrictEqual(response.body, payload)
    })
  })

  describe('GET /pet', function () {
    const payload = {
      id: 1,
      name: 'Max',
      category: {
        id: 1,
        name: 'Dogs'
      },
      photoUrls: [
        'http://example.com/photo1.jpg'
      ],
      tags: [
        {
          id: 1,
          name: 'tag1'
        }
      ],
      status: 'available'
    }

    it('return valid payload', async function () {
      const response = await request(app).get('/SwaggerPetstoreOpenAPI30_1019/pet/1').expect(200)
      assert.deepStrictEqual(response.body, payload)
    })

    it('return error', async function () {
      const response = await request(app).get('/SwaggerPetstoreOpenAPI30_1019/pet/2').expect(400)
      assert.deepStrictEqual(response.body, {
        error: {
          message: 'invalid id 2'
        }
      })
    })

    it('return empty', async function () {
      const response = await request(app).get('/SwaggerPetstoreOpenAPI30_1019/pet/3').expect(200)
      assert.deepStrictEqual(response.body, payload)
    })
  })
})
