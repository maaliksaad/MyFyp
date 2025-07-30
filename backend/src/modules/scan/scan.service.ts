import { UserInputError } from '@nestjs/apollo'
import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { InjectModel } from '@nestjs/sequelize'
import { Op, type Transaction } from 'sequelize'
import slugify from 'slugify'

import { Scan, User } from '@/models'
import { FileService } from '@/modules/file/file.service'
import { ProjectService } from '@/modules/project/project.service'
import { type CreateScanDto } from '@/modules/scan/dtos'
import { ScanProcessEvent } from '@/modules/scan/events'

@Injectable()
export class ScanService {
  constructor(
    private readonly fileService: FileService,
    private readonly projectService: ProjectService,
    private readonly eventEmitter: EventEmitter2,
    private readonly config: ConfigService,
    private readonly http: HttpService,
    @InjectModel(Scan) private readonly scanModel: typeof Scan
  ) {}

  async create(
    { data, user }: { data: CreateScanDto; user: User },
    transaction: Transaction
  ): Promise<Scan> {
    const file = await this.fileService.findById(
      { file_id: data.input_file_id },
      transaction
    )

    await this.projectService.findOne(
      {
        project_id: data.project_id,
        user_id: user.user_id
      },
      transaction
    )

    let slug = slugify(data.name, {
      lower: true
    })

    const scanSlugs = await this.scanModel.findAll({
      where: {
        slug: {
          [Op.like]: `${slug}%`
        }
      },
      attributes: ['slug'],
      transaction
    })

    const scan = scanSlugs.find(proj => proj.slug === slug)

    if (scan != null) {
      slug += `-${scanSlugs.length}`
    }

    const { scan_id } = await this.scanModel.create(
      {
        ...data,
        slug,
        user_id: user.user_id
      },
      {
        transaction
      }
    )

    this.eventEmitter.emit(
      'scan.process',
      new ScanProcessEvent({
        scan_id,
        input_file: file
      })
    )

    return await this.findOne(
      {
        scan_id,
        user_id: user.user_id
      },
      transaction
    )
  }

  async findAll({ user_id }: { user_id: number }, transaction: Transaction) {
    const scans = await this.scanModel.findAll({
      where: {
        user_id
      },
      include: {
        all: true,
        nested: true
      },
      transaction
    })

    return scans.map(scan => scan.toJSON())
  }

  async findOne(
    {
      scan_id,
      user_id,
      slug
    }: { scan_id?: number; user_id: number; slug?: string },
    transaction: Transaction
  ) {
    if (scan_id == null && slug == null) {
      throw new UserInputError('id or slug is required')
    }

    const scan = await this.scanModel.findOne({
      where: {
        ...(scan_id == null ? { slug } : { scan_id }),
        user_id
      },
      include: {
        all: true,
        nested: true
      },
      transaction
    })

    if (scan == null) {
      throw new UserInputError('Scan not found')
    }

    return scan.toJSON()
  }

  async findPublic(
    { scan_id, slug }: { scan_id?: number; slug?: string },
    transaction: Transaction
  ) {
    if (scan_id == null && slug == null) {
      throw new UserInputError('id or slug is required')
    }

    const scan = await this.scanModel.findOne({
      where: {
        ...(scan_id == null ? { slug } : { scan_id })
      },
      include: {
        all: true,
        nested: true
      },
      transaction
    })

    if (scan == null) {
      throw new UserInputError('Scan not found')
    }

    return scan.toJSON()
  }

  async update(
    { id, data }: { id: number; data: Partial<Scan> },
    transaction: Transaction
  ) {
    await this.scanModel.update(data, {
      where: {
        scan_id: id
      },
      transaction
    })
  }

  async delete({ scan }: { scan: Scan }, transaction: Transaction) {
    await this.fileService.delete({ file: scan.input_file }, transaction)
    if (scan.splat_file != null) {
      await this.fileService.delete({ file: scan.splat_file }, transaction)
    }

    await this.scanModel.destroy({
      where: {
        scan_id: scan.scan_id
      },
      transaction
    })
  }

  @OnEvent('scan.process')
  async processScan(event: ScanProcessEvent) {
    try {
      await this.http.axiosRef.post(
        `${this.config.getOrThrow('RUNPOD_PROCESS_URI')}/run`,
        {
          input: {
            key: event.data.input_file.key,
            bucket: event.data.input_file.bucket,
            scan_id: event.data.scan_id,
            dataset_type: 'video',
            method: 'gaussian-splatting'
          }
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.getOrThrow('RUNPOD_API_KEY')}`
          }
        }
      )
    } catch {
      throw new Error('Scan processing failed!')
    }
  }
}
