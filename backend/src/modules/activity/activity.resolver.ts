import { UseGuards } from '@nestjs/common'
import { Args, Query, Resolver } from '@nestjs/graphql'
import { InjectConnection } from '@nestjs/sequelize'
import { Sequelize } from 'sequelize'

import { GetUser } from '@/decorators'
import { TokenJwtGuard } from '@/guards'
import { Activity, User } from '@/models'
import { ActivityService } from '@/modules/activity/activity.service'

@Resolver('Activity')
@UseGuards(TokenJwtGuard)
export class ActivityResolver {
  constructor(
    private readonly activityService: ActivityService,
    @InjectConnection() private readonly sequelize: Sequelize
  ) {}

  @Query(() => [Activity], { name: 'activities' })
  async findAll(
    @GetUser() user: User,
    @Args('project_slug', { nullable: true }) project_slug?: string,
    @Args('scan_slug', { nullable: true }) scan_slug?: string
  ) {
    return await this.sequelize.transaction(async t => {
      return await this.activityService.findAll(
        {
          project_slug,
          scan_slug,
          user_id: user.user_id
        },
        t
      )
    })
  }
}
