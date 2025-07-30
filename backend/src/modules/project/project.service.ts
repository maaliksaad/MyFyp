import { UserInputError } from '@nestjs/apollo'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op, type Transaction } from 'sequelize'
import slugify from 'slugify'

import { Sort, SortBy } from '@/enums'
import { Project, User } from '@/models'
import { FileService } from '@/modules/file/file.service'
import { type CreateProjectDto } from '@/modules/project/dtos'

@Injectable()
export class ProjectService {
  constructor(
    private readonly fileService: FileService,
    @InjectModel(Project) private readonly projectModel: typeof Project
  ) {}

  async findAll(
    {
      user_id,
      options
    }: {
      user_id: number
      options: {
        sort_by?: SortBy
        sort?: Sort
        limit?: number
      }
    },
    transaction: Transaction
  ) {
    const projects = await this.projectModel.findAll({
      where: {
        user_id
      },
      include: {
        all: true,
        nested: true
      },
      limit: options.limit,
      order: [
        [
          options.sort_by == null
            ? 'project_id'
            : (options.sort_by as unknown as string),
          options.sort == null
            ? 'ASC'
            : options.sort === 'ascending'
              ? 'ASC'
              : 'DESC'
        ]
      ],
      transaction
    })

    return projects.map(project => project.toJSON())
  }

  async findOne(
    {
      project_id,
      user_id,
      slug
    }: {
      project_id?: number
      user_id: number
      slug?: string
    },
    transaction: Transaction
  ): Promise<Project> {
    if (project_id == null && slug == null) {
      throw new UserInputError('id or slug is required')
    }

    const project = await this.projectModel.findOne({
      where: {
        user_id,
        ...(project_id == null ? { slug } : { project_id })
      },
      include: {
        all: true,
        nested: true
      },
      transaction
    })

    if (project == null) {
      throw new UserInputError('Project not found')
    }

    return project.toJSON()
  }

  async create(
    {
      data,
      user
    }: {
      data: CreateProjectDto
      user: User
    },
    transaction: Transaction
  ) {
    await this.fileService.findById({ file_id: data.thumbnail_id }, transaction)

    let slug = slugify(data.name, {
      lower: true
    })

    const projectSlugs = await this.projectModel.findAll({
      where: {
        slug: {
          [Op.like]: `${slug}%`
        }
      },
      attributes: ['slug'],
      transaction
    })

    const project = projectSlugs.find(proj => proj.slug === slug)

    if (project != null) {
      slug += `-${projectSlugs.length}`
    }

    const { project_id } = await this.projectModel.create(
      {
        ...data,
        slug,
        user_id: user.user_id
      },
      {
        transaction
      }
    )

    return await this.findOne(
      {
        project_id,
        user_id: user.user_id
      },
      transaction
    )
  }

  async update(
    { id, data }: { id: number; data: Partial<Project> },
    transaction: Transaction
  ) {
    await this.projectModel.update(data, {
      where: {
        project_id: id
      },
      transaction
    })
  }

  async delete({ project }: { project: Project }, transaction: Transaction) {
    await this.fileService.delete({ file: project.thumbnail }, transaction)

    await this.projectModel.destroy({
      where: {
        project_id: project.project_id
      },
      transaction
    })
  }
}
