import { faker } from '@faker-js/faker'
import { Test, type TestingModule } from '@nestjs/testing'

import { createPopulatedFile } from '@/factories'
import { File } from '@/models'
import { FileController } from '@/modules/file/file.controller'
import { FileService } from '@/modules/file/file.service'
import { StorageService } from '@/modules/storage/storage.service'
import { ThumbnailService } from '@/modules/thumbnail/thumbnail.service'
import { TUS_SERVER } from '@/modules/tus/constants'
import { createModelStub } from '@/tests/create-model.stub'

describe('FileController', () => {
  let fileController: FileController
  let fileService: FileService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: createModelStub(File),
      controllers: [FileController],
      providers: [
        FileService,
        {
          provide: StorageService,
          useValue: {
            upload: jest
              .fn()
              .mockImplementation((file: Express.Multer.File) => ({
                key: 'key',
                bucket: 'bucket',
                url: 'url',
                name: file.originalname
              }))
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

    fileController = module.get<FileController>(FileController)
    fileService = module.get<FileService>(FileService)
  })

  it('controller and service should be defined', () => {
    expect(fileController).toBeDefined()
    expect(fileService).toBeDefined()
  })

  describe('getFile', () => {
    it('given an invalid key: should throw an error', async () => {
      jest.spyOn(fileService, 'findByKey').mockRejectedValue('File not found')

      await expect(fileController.getFile('invalid-key')).rejects.toThrow()
    })

    it('given a valid key: should return a file', async () => {
      const file = createPopulatedFile()

      jest.spyOn(fileService, 'findByKey').mockResolvedValue(file)

      const result = await fileController.getFile(file.key)

      expect(result).toMatchObject(file)
    })
  })

  describe('handleFile', () => {
    it('given an error in handler: should throw an error', async () => {
      jest.spyOn(fileService, 'handle').mockRejectedValue('Error')

      const res = await fileController.handleFile(
        { originalUrl: 'url' } as any,
        { end: jest.fn() } as any
      )

      expect(res).toMatchObject({
        statusCode: 500,
        statusMessage: 'Internal Server Error'
      })
    })

    it('given valid data: should return the file', async () => {
      jest.spyOn(fileService, 'handle').mockResolvedValue({
        statusCode: 200,
        statusMessage: 'OK'
      } as any)

      const result = await fileController.handleFile(
        { originalUrl: 'url' } as any,
        { end: jest.fn() } as any
      )

      expect(result).toMatchObject({
        statusCode: 200,
        statusMessage: 'OK'
      })
    })
  })

  describe('handleFileId', () => {
    it('given an error in handler: should throw an error', async () => {
      jest.spyOn(fileService, 'handle').mockRejectedValue('Error')

      const res = await fileController.handleFileId(
        { originalUrl: 'url' } as any,
        { end: jest.fn() } as any
      )

      expect(res).toMatchObject({
        statusCode: 500,
        statusMessage: 'Unknown Error while handling file id'
      })
    })

    it('given valid data: should return the file', async () => {
      jest.spyOn(fileService, 'handle').mockResolvedValue({
        statusCode: 200,
        statusMessage: 'OK'
      } as any)

      const result = await fileController.handleFileId(
        { originalUrl: 'url' } as any,
        { end: jest.fn() } as any
      )

      expect(result).toMatchObject({
        statusCode: 200,
        statusMessage: 'OK'
      })
    })
  })
})
