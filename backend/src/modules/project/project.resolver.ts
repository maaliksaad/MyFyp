import { UseGuards } from '@nestjs/common'
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { InjectConnection } from '@nestjs/sequelize'
import { Sequelize } from 'sequelize'

import { GetUser } from '@/decorators'
import { Sort, SortBy } from '@/enums'
import { TokenJwtGuard } from '@/guards'
import { Project, User } from '@/models'
import { ActivityService } from '@/modules/activity/activity.service'
import { ProjectActivityEvent } from '@/modules/activity/events'
import { CreateProjectDto, UpdateProjectDto } from '@/modules/project/dtos'
import { ProjectService } from '@/modules/project/project.service'

@Resolver('Project')
@UseGuards(TokenJwtGuard)
export class ProjectResolver {
  constructor(
    private readonly projectService: ProjectService,
    private readonly activityService: ActivityService,
    @InjectConnection() private readonly sequelize: Sequelize
  ) {}

  @Query(() => [Project], { name: 'projects' })
  async findAll(
    @GetUser() user: User,
    @Args('sort_by', { type: () => SortBy, nullable: true }) sort_by?: SortBy,
    @Args('sort', { type: () => Sort, nullable: true }) sort?: Sort,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number
  ) {
    return await this.sequelize.transaction(async t => {
      return await this.projectService.findAll(
        {
          user_id: user.user_id,
          options: {
            sort_by,
            sort,
            limit
          }
        },
        t
      )
    })
  }

  @Query(() => Project, { name: 'project' })
  async findOne(
    @GetUser() user: User,
    @Args('id', { type: () => Int, nullable: true }) id?: number,
    @Args('slug', { type: () => String, nullable: true }) slug?: string
  ) {
    return await this.sequelize.transaction(async t => {
      return await this.projectService.findOne(
        {
          user_id: user.user_id,
          project_id: id,
          slug
        },
        t
      )
    })
  }

  @Mutation(() => Project, { name: 'create_project' })
  async createProject(
    @GetUser() user: User,
    @Args('data') data: CreateProjectDto
  ) {
    const project = await this.sequelize.transaction(async t => {
      return await this.projectService.create({ data, user }, t)
    })

    this.activityService.create({
      type: 'project',
      event: new ProjectActivityEvent({
        project_id: project.project_id,
        type: 'created'
      })
    })

    return project
  }

  @Mutation(() => Project, { name: 'update_project' })
  async updateProject(
    @GetUser() user: User,
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateProjectDto
  ) {
    const project = await this.sequelize.transaction(async t => {
      await this.projectService.findOne(
        {
          user_id: user.user_id,
          project_id: id
        },
        t
      )

      await this.projectService.update({ id, data }, t)

      return await this.projectService.findOne(
        {
          project_id: id,
          user_id: user.user_id
        },
        t
      )
    })

    this.activityService.create({
      type: 'project',
      event: new ProjectActivityEvent({
        project_id: id,
        type: 'updated'
      })
    })

    return project
  }

  @Mutation(() => Project, { name: 'delete_project' })
  async deleteProject(
    @GetUser() user: User,
    @Args('id', { type: () => Int }) id: number
  ) {
    return await this.sequelize.transaction(async t => {
      const project = await this.projectService.findOne(
        {
          user_id: user.user_id,
          project_id: id
        },
        t
      )

      await this.projectService.delete({ project }, t)

      return project
    })
  }
}
