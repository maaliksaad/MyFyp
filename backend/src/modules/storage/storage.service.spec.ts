import {
  type CompleteMultipartUploadCommandOutput,
  type S3Client
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { faker } from '@faker-js/faker'
import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'

import { StorageService } from '@/modules/storage/storage.service'

describe('StorageService', () => {
  let storageService: StorageService
  let s3Client: S3Client

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('key'),
            getOrThrow: jest.fn().mockReturnValue('key')
          }
        },
        {
          provide: 'S3_CLIENT',
          useValue: {
            send: jest.fn()
          }
        }
      ]
    }).compile()

    storageService = module.get<StorageService>(StorageService)
    s3Client = module.get<S3Client>('S3_CLIENT')
  })

  it('should be defined', () => {
    expect(storageService).toBeDefined()
  })

  describe('upload', () => {
    it('should upload a file', async () => {
      jest.spyOn(Upload.prototype, 'done').mockResolvedValue({
        key: faker.system.fileName()
      } as unknown as CompleteMultipartUploadCommandOutput)

      const file = {
        buffer: Buffer.from('Test file content'),
        originalname: 'test.png'
      } as Express.Multer.File

      const result = await storageService.upload({
        file,
        key: 'key'
      })

      expect(result).toMatchObject({
        name: file.originalname,
        key: expect.any(String),
        bucket: 'key',
        url: expect.any(String)
      })
    })
  })

  describe('delete', () => {
    it('should delete a file', async () => {
      jest.spyOn(s3Client, 'send').mockResolvedValue({} as never)

      const key = faker.system.fileName()

      const result = await storageService.delete(key)

      expect(result).toBe(true)
    })

    it('should return false if the file does not exist', async () => {
      jest
        .spyOn(s3Client, 'send')
        .mockRejectedValue(new Error('File not found') as never)

      const key = faker.system.fileName()

      const result = await storageService.delete(key)

      expect(result).toBe(false)
    })
  })

  describe('get', () => {
    it('given a valid key: should return the file', async () => {
      jest.spyOn(s3Client, 'send').mockResolvedValue({
        ContentType: 'image/png'
      } as never)

      const key = faker.system.fileName()

      const result = await storageService.get(key)

      expect(result).toMatchObject({
        name: expect.any(String),
        key,
        bucket: 'key',
        url: expect.any(String),
        mimetype: 'image/png'
      })
    })

    it('given an invalid key: should throw the error', async () => {
      jest
        .spyOn(s3Client, 'send')
        .mockRejectedValue(new Error('File not found') as never)

      const key = faker.system.fileName()

      await expect(storageService.get(key)).rejects.toThrow('File not found')
    })
  })

  describe('enablePublicAccess', () => {
    it('should enable public access to a file', async () => {
      jest.spyOn(s3Client, 'send').mockResolvedValue({} as never)

      const key = faker.system.fileName()

      await storageService.enablePublicAccess(key)

      expect(s3Client.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            ACL: 'public-read'
          })
        })
      )
    })
  })
})
