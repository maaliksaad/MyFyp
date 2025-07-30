import { getConnectionToken, getModelToken } from '@nestjs/sequelize'
import { Test, type TestingModule } from '@nestjs/testing'
import type { Sequelize } from 'sequelize'

import { Sort, SortBy } from '@/enums'
import { createPopulatedFile, createPopulatedUser } from '@/factories'
import { File, Project, Scan, User } from '@/models'
import { ActivityService } from '@/modules/activity/activity.service'
import { FileService } from '@/modules/file/file.service'
import { ProjectService } from '@/modules/project/project.service'
import { createModelStub } from '@/tests/create-model.stub'
import { createAndSaveProject } from '@/tests/util'

describe('ProjectService', () => {
  let projectService: ProjectService
  let fileService: FileService
  let projectModel: typeof Project
  let fileModel: typeof File
  let userModel: typeof User
  let sequelize: Sequelize

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...createModelStub(Scan, File, User, Project)],
      providers: [
        ProjectService,
        {
          provide: FileService,
          useValue: {
            findById: jest.fn().mockResolvedValue(createPopulatedFile()),
            delete: jest.fn().mockResolvedValue(null)
          }
        },
        {
          provide: ActivityService,
          useValue: {
            create: jest.fn().mockResolvedValue(null)
          }
        }
      ]
    }).compile()

    projectService = module.get<ProjectService>(ProjectService)
    fileService = module.get<FileService>(FileService)
    fileModel = module.get<typeof File>(getModelToken(File))
    userModel = module.get<typeof User>(getModelToken(User))
    projectModel = module.get<typeof Project>(getModelToken(Project))
    sequelize = module.get<Sequelize>(getConnectionToken())
  })

  afterEach(async () => {
    await fileModel.destroy({ where: {}, truncate: true })
    await userModel.destroy({ where: {}, truncate: true })
    await projectModel.destroy({ where: {}, truncate: true })
  })

  it('should be defined', () => {
    expect(projectService).toBeDefined()
    expect(fileService).toBeDefined()
    expect(projectModel).toBeDefined()
    expect(fileModel).toBeDefined()
    expect(userModel).toBeDefined()
  })

  describe('findAll', () => {
    it('given no projects: should return an empty array', async () => {
      const transaction = await sequelize.transaction()

      const result = await projectService.findAll(
        {
          user_id: 1,
          options: {
            sort_by: SortBy.name,
            sort: Sort.ascending,
            limit: 10
          }
        },
        transaction
      )

      expect(result).toHaveLength(0)
    })

    it('given a user_id: should return all projects of the user', async () => {
      const transaction = await sequelize.transaction()

      const { user, project } = await createAndSaveProject({
        userModel,
        fileModel,
        projectModel
      })

      const result = await projectService.findAll(
        { user_id: user.user_id, options: {} },
        transaction
      )

      expect(result).toHaveLength(1)

      expect(result).toMatchObject([project])
    })
  })

  describe('findOne', () => {
    it('given no data: should throw an error', async () => {
      const transaction = await sequelize.transaction()

      await expect(
        projectService.findOne({ user_id: 1 }, transaction)
      ).rejects.toThrow('id or slug is required')
    })

    it('given an invalid project_id: should throw an error', async () => {
      const transaction = await sequelize.transaction()

      await expect(
        projectService.findOne(
          {
            project_id: 1,
            user_id: 1
          },
          transaction
        )
      ).rejects.toThrow('Project not found')
    })

    it('given a valid project_id: should return the project', async () => {
      const transaction = await sequelize.transaction()

      const { user, project } = await createAndSaveProject({
        userModel,
        fileModel,
        projectModel
      })

      const result = await projectService.findOne(
        {
          user_id: user.user_id,
          project_id: project.project_id
        },
        transaction
      )

      expect(result).toMatchObject(project)
    })

    it('given a valid slug: should return the project', async () => {
      const transaction = await sequelize.transaction()

      const { user, project } = await createAndSaveProject({
        userModel,
        fileModel,
        projectModel
      })

      const result = await projectService.findOne(
        {
          user_id: user.user_id,
          slug: project.slug
        },
        transaction
      )

      expect(result).toMatchObject(project)
    })
  })

  describe('create', () => {
    it('given an invalid file_id: should throw an error', async () => {
      const transaction = await sequelize.transaction()

      const user = createPopulatedUser()
      await userModel.create({ ...user })

      jest
        .spyOn(fileService, 'findById')
        .mockRejectedValue(new Error('Invalid file id'))

      await expect(
        projectService.create(
          {
            data: {
              name: 'project',
              thumbnail_id: 1
            },
            user
          },
          transaction
        )
      ).rejects.toThrow('Invalid file id')
    })

    it('given valid data and a user: should create a project', async () => {
      const transaction = await sequelize.transaction()

      const user = createPopulatedUser()
      await userModel.create({ ...user })

      const thumbnail = createPopulatedFile()
      await fileModel.create({ ...thumbnail })

      const result = await projectService.create(
        {
          data: {
            name: 'project',
            thumbnail_id: thumbnail.file_id
          },
          user
        },
        transaction
      )

      expect(result).toMatchObject({
        project_id: expect.any(Number),
        name: 'project',
        slug: 'project',
        user,
        thumbnail,
        created_at: expect.any(Date)
      })
    })

    it('given a project with the same name: should create a project with a different slug', async () => {
      const transaction = await sequelize.transaction()

      const { user, project, thumbnail } = await createAndSaveProject({
        userModel,
        fileModel,
        projectModel
      })

      const result = await projectService.create(
        {
          data: {
            name: project.name,
            thumbnail_id: thumbnail.file_id
          },
          user
        },
        transaction
      )

      expect(result).toMatchObject({
        project_id: expect.any(Number),
        name: project.name,
        slug: `${project.slug}-1`,
        user,
        thumbnail,
        created_at: expect.any(Date)
      })
    })
  })

  describe('update', () => {
    it('given a valid id and data: should update the project', async () => {
      const transaction = await sequelize.transaction()

      const { user, project } = await createAndSaveProject({
        userModel,
        fileModel,
        projectModel
      })

      await projectService.update(
        {
          id: project.project_id,
          data: {
            name: 'new project'
          }
        },
        transaction
      )

      const result = await projectService.findOne(
        {
          project_id: project.project_id,
          user_id: user.user_id
        },
        transaction
      )

      expect(result).toMatchObject({
        ...project,
        name: 'new project'
      })
    })
  })

  describe('delete', () => {
    it('given a valid project: should delete the project', async () => {
      const transaction = await sequelize.transaction()

      const { user, project, thumbnail } = await createAndSaveProject({
        userModel,
        fileModel,
        projectModel
      })

      project.thumbnail = thumbnail

      await projectService.delete({ project }, transaction)

      const result = await projectService.findAll(
        {
          user_id: user.user_id,
          options: {
            sort_by: SortBy.name,
            sort: Sort.descending,
            limit: 10
          }
        },
        transaction
      )

      expect(result).toHaveLength(0)
    })
  })
})
