import { faker } from '@faker-js/faker'
import { Test, type TestingModule } from '@nestjs/testing'

import {
  createPopulatedFile,
  createPopulatedProject,
  createPopulatedUser
} from '@/factories'
import { File, Project, Scan, User } from '@/models'
import { ActivityService } from '@/modules/activity/activity.service'
import { FileService } from '@/modules/file/file.service'
import { ProjectResolver } from '@/modules/project/project.resolver'
import { ProjectService } from '@/modules/project/project.service'
import { createModelStub } from '@/tests/create-model.stub'

describe('ProjectResolver', () => {
  let projectResolver: ProjectResolver
  let projectService: ProjectService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...createModelStub(Scan, File, User, Project)],
      providers: [
        ProjectResolver,
        ProjectService,
        {
          provide: FileService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(createPopulatedFile()),
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

    projectResolver = module.get<ProjectResolver>(ProjectResolver)
    projectService = module.get<ProjectService>(ProjectService)
  })

  it('should be defined', () => {
    expect(projectResolver).toBeDefined()
    expect(projectService).toBeDefined()
  })

  describe('findAll', () => {
    it('should return all projects', async () => {
      const user = createPopulatedUser()

      const project = createPopulatedProject({
        user_id: user.user_id
      })
      jest.spyOn(projectService, 'findAll').mockResolvedValue([project])

      const result = await projectResolver.findAll(user)

      expect(result).toMatchObject([project])
    })
  })

  describe('findOne', () => {
    it('given an invalid project_id: should throw exception', async () => {
      const user = createPopulatedUser()

      jest
        .spyOn(projectService, 'findOne')
        .mockRejectedValue('Project not found')

      await expect(projectResolver.findOne(user, 1)).rejects.toEqual(
        'Project not found'
      )
    })

    it('given a valid project_id: should return the project', async () => {
      const user = createPopulatedUser()
      const project = createPopulatedProject({
        user_id: user.user_id
      })

      jest.spyOn(projectService, 'findOne').mockResolvedValue(project)

      const result = await projectResolver.findOne(user, project.project_id)

      expect(result).toMatchObject(project)
    })
  })

  describe('createProject', () => {
    it('given valid data and a user: should create a project', async () => {
      const user = createPopulatedUser()
      const file = createPopulatedFile()

      const project = createPopulatedProject({
        user_id: user.user_id,
        thumbnail_id: file.file_id
      })

      jest.spyOn(projectService, 'create').mockResolvedValue(project)

      const result = await projectResolver.createProject(user, {
        name: project.name,
        thumbnail_id: file.file_id
      })

      expect(result).toMatchObject(project)
    })
  })

  describe('updateProject', () => {
    it('given an invalid project_id: should throw exception', async () => {
      const user = createPopulatedUser()

      jest
        .spyOn(projectService, 'findOne')
        .mockRejectedValue('Project not found')

      await expect(
        projectResolver.updateProject(user, 1, {
          name: faker.lorem.words()
        })
      ).rejects.toEqual('Project not found')
    })

    it('given valid data and a user: should update the project', async () => {
      const user = createPopulatedUser()
      const project = createPopulatedProject({
        user_id: user.user_id
      })

      const data = {
        name: faker.lorem.words()
      }

      jest.spyOn(projectService, 'findOne').mockResolvedValue(project)

      const result = await projectResolver.updateProject(
        user,
        project.project_id,
        data
      )

      expect(result).toMatchObject(project)
    })
  })

  describe('deleteProject', () => {
    it('given an invalid project_id: should throw exception', async () => {
      const user = createPopulatedUser()

      jest
        .spyOn(projectService, 'findOne')
        .mockRejectedValue('Project not found')

      await expect(projectResolver.deleteProject(user, 1)).rejects.toEqual(
        'Project not found'
      )
    })

    it('given a valid project_id: should delete the project', async () => {
      const user = createPopulatedUser()
      const project = createPopulatedProject({
        user_id: user.user_id
      })

      jest.spyOn(projectService, 'findOne').mockResolvedValue(project)
      jest.spyOn(projectService, 'delete').mockResolvedValue()

      const result = await projectResolver.deleteProject(
        user,
        project.project_id
      )

      expect(result).toMatchObject(project)
    })
  })
})
