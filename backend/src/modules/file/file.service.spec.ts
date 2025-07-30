import { faker } from '@faker-js/faker'
import { getConnectionToken, getModelToken } from '@nestjs/sequelize'
import { Test, type TestingModule } from '@nestjs/testing'
import { type Server } from '@tus/server'
import type { Sequelize } from 'sequelize'

import { createPopulatedFile } from '@/factories'
import { File } from '@/models'
import { FileService } from '@/modules/file/file.service'
import { StorageService } from '@/modules/storage/storage.service'
import { ThumbnailService } from '@/modules/thumbnail/thumbnail.service'
import { TUS_SERVER } from '@/modules/tus/constants'
import { createModelStub } from '@/tests/create-model.stub'

describe('FileService', () => {
  let fileService: FileService
  let server: Server
  let fileModel: typeof File
  let sequelize: Sequelize

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: createModelStub(File),
      providers: [
        FileService,
        {
          provide: StorageService,
          useValue: {
            get: jest.fn().mockReturnValue({
              key: 'key',
              bucket: 'bucket',
              url: 'url',
              name: 'name',
              mimetype: 'mimetype'
            }),
            enablePublicAccess: jest.fn(),
            delete: jest.fn()
          }
        },
        {
          provide: ThumbnailService,
          useValue: {
            generate: jest.fn().mockReturnValue(faker.internet.url())
          }
        },
        {
          provide: TUS_SERVER,
          useValue: {
            handle: jest.fn()
          }
        }
      ]
    }).compile()

    fileService = module.get<FileService>(FileService)
    fileModel = module.get<typeof File>(getModelToken(File))
    server = module.get<Server>(TUS_SERVER)
    sequelize = module.get<Sequelize>(getConnectionToken())
  })

  afterEach(async () => {
    await fileModel.destroy({ where: {}, truncate: true })
  })

  it('should be defined', () => {
    expect(fileService).toBeDefined()
  })

  describe('findById', () => {
    it('given an invalid file_id: should throw an error', async () => {
      const transaction = await sequelize.transaction()

      const file = createPopulatedFile()

      await expect(
        fileService.findById({ file_id: file.file_id }, transaction)
      ).rejects.toThrow('File not found')
    })

    it('given a valid file_id: should return the file', async () => {
      const transaction = await sequelize.transaction()

      const file = createPopulatedFile()
      await fileModel.create({ ...file })

      const result = await fileService.findById(
        { file_id: file.file_id },
        transaction
      )

      expect(result).toMatchObject(file)
    })
  })

  describe('findByKey', () => {
    it('given an invalid key: should throw an error', async () => {
      const transaction = await sequelize.transaction()

      const file = createPopulatedFile()

      await expect(
        fileService.findByKey({ key: file.key }, transaction)
      ).rejects.toThrow('Not Found Exception')
    })

    it('given a valid key: should return the file', async () => {
      const transaction = await sequelize.transaction()

      const file = createPopulatedFile()
      await fileModel.create({ ...file })

      const result = await fileService.findByKey({ key: file.key }, transaction)

      expect(result).toMatchObject(file)
    })
  })

  describe('delete', () => {
    it('should delete a file', async () => {
      const transaction = await sequelize.transaction()

      const file = createPopulatedFile()
      await fileModel.create({ ...file })

      await fileService.delete({ file }, transaction)

      const result = await fileModel.findOne({
        where: { file_id: file.file_id }
      })

      expect(result).toBeNull()
    })
  })

  describe('handle', () => {
    it('should handle a file', async () => {
      const req = {} as any
      const res = {} as any

      await fileService.handle(req, res)

      expect(server.handle).toHaveBeenCalledWith(req, res)
    })
  })

  describe('onUploadFinish', () => {
    it('given no filetype: should return a 400 response', async () => {
      const req = {} as any
      const res = {
        statusCode: 200,
        statusMessage: 'OK'
      } as any
      const upload = {
        metadata: {}
      } as any

      const result = await fileService.onUploadFinish(req, res, upload)

      expect(result).toMatchObject({
        statusCode: 400,
        statusMessage: 'Invalid Filetype'
      })
    })

    it('given an invalid filetype: return a 400 response', async () => {
      const req = {
        headers: {
          'file-type': 'Image'
        }
      } as any
      const res = {
        statusCode: 200,
        statusMessage: 'OK'
      } as any
      const upload = {
        metadata: {
          filetype: 'Image'
        }
      } as any

      const result = await fileService.onUploadFinish(req, res, upload)

      expect(result).toMatchObject(res)
    })

    it('given an invalid upload id: should return a 400 response', async () => {
      const req = {
        headers: {
          'file-type': 'video'
        }
      } as any
      const res = {
        statusCode: 200,
        statusMessage: 'OK'
      } as any
      const upload = {
        id: '/id',
        metadata: {
          filetype: 'video'
        }
      } as any

      const result = await fileService.onUploadFinish(req, res, upload)

      expect(result).toMatchObject({
        statusCode: 400,
        statusMessage: 'Invalid Filetype'
      })
    })

    it('given a valid filetype: should return the response', async () => {
      const req = {
        headers: {
          'file-type': 'video'
        }
      } as any
      const res = {
        statusCode: 200,
        statusMessage: 'OK'
      } as any
      const upload = {
        id: 'videos/id',
        metadata: {
          filetype: 'video'
        }
      } as any

      const result = await fileService.onUploadFinish(req, res, upload)

      expect(result).toMatchObject(res)
    })

    it('given an image filetype: should return the response', async () => {
      const req = {
        headers: {
          'file-type': 'image'
        }
      } as any
      const res = {
        statusCode: 200,
        statusMessage: 'OK'
      } as any
      const upload = {
        id: 'image/id',
        metadata: {
          filetype: 'image'
        }
      } as any

      const result = await fileService.onUploadFinish(req, res, upload)

      expect(result).toMatchObject(res)
    })
  })

  describe('namingFunction', () => {
    it('given a filename: should return a string', async () => {
      const req = {
        headers: {
          'file-name': 'video.mp4'
        }
      } as any

      const result = await fileService.namingFunction(req)

      expect(result).toEqual(expect.any(String))
    })

    it('given no filename: should return a string', async () => {
      const req = {
        headers: {}
      } as any

      const result = await fileService.namingFunction(req)

      expect(result).toEqual(expect.any(String))
    })
  })
})
