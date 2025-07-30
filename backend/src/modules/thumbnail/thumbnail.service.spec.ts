import { faker } from '@faker-js/faker'
import { Test, type TestingModule } from '@nestjs/testing'
import * as fs from 'fs'
import * as thumbsupply from 'thumbsupply'

import { StorageService } from '@/modules/storage/storage.service'
import { ThumbnailService } from '@/modules/thumbnail/thumbnail.service'

describe('ThumbnailService', () => {
  let thumbnailService: ThumbnailService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThumbnailService,
        {
          provide: StorageService,
          useValue: {
            upload: jest.fn().mockResolvedValue({
              url: faker.internet.url()
            })
          }
        }
      ]
    }).compile()

    thumbnailService = module.get<ThumbnailService>(ThumbnailService)
  })

  it('should be defined', () => {
    expect(thumbnailService).toBeDefined()
  })

  describe('generate', () => {
    it('given an image url, should return the same url', async () => {
      const url = faker.internet.url()
      const mimetype = 'image/jpeg'

      const result = await thumbnailService.generate({ url, mimetype })

      expect(result).toBe(url)
    })

    it('given a zip file url, should return the same url', async () => {
      const url = faker.internet.url()
      const mimetype = 'application/zip'

      const result = await thumbnailService.generate({ url, mimetype })

      expect(result).toMatch(url)
    })

    it('given an issue with thumb supply, should return the same url', async () => {
      const url = faker.internet.url()
      const mimetype = 'video/mp4'

      jest.spyOn(thumbsupply, 'generateThumbnail').mockResolvedValue('')

      const result = await thumbnailService.generate({ url, mimetype })

      expect(result).toBe(url)
    })

    it('given a video url, should return a thumbnail url', async () => {
      const url = faker.internet.url()
      const mimetype = 'video/mp4'

      jest
        .spyOn(thumbsupply, 'generateThumbnail')
        .mockResolvedValue('path/to/thumbnail.jpg')

      jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from(''))
      jest.spyOn(fs, 'existsSync').mockReturnValue(true)
      jest.spyOn(fs, 'unlinkSync').mockReturnValue()

      const result = await thumbnailService.generate({ url, mimetype })

      expect(result).toMatch(/https:\/\/.*/)
    })
  })
})
