import { UseGuards } from '@nestjs/common'
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { InjectConnection } from '@nestjs/sequelize'
import { Sequelize } from 'sequelize'

import { GetUser } from '@/decorators'
import { TokenJwtGuard } from '@/guards'
import { Scan, User } from '@/models'
import { ActivityService } from '@/modules/activity/activity.service'
import { ScanActivityEvent } from '@/modules/activity/events'
import { NotificationService } from '@/modules/notification/notification.service'
import { CreateScanDto, UpdateScanDto } from '@/modules/scan/dtos'
import { ScanService } from '@/modules/scan/scan.service'

@Resolver('Scan')
export class ScanResolver {
  constructor(
    private readonly scanService: ScanService,
    private readonly activityService: ActivityService,
    private readonly notificationService: NotificationService,
    @InjectConnection() private readonly sequelize: Sequelize
  ) {}

  @Query(() => [Scan], { name: 'scans' })
  @UseGuards(TokenJwtGuard)
  async findAll(@GetUser() user: User) {
    return await this.sequelize.transaction(async t => {
      return await this.scanService.findAll({ user_id: user.user_id }, t)
    })
  }

  @Query(() => Scan, { name: 'scan' })
  @UseGuards(TokenJwtGuard)
  async findOne(
    @GetUser() user: User,
    @Args('id', { type: () => Int, nullable: true }) id?: number,
    @Args('slug', { type: () => String, nullable: true }) slug?: string
  ) {
    return await this.sequelize.transaction(async t => {
      return await this.scanService.findOne(
        {
          user_id: user.user_id,
          scan_id: id,
          slug
        },
        t
      )
    })
  }

  @Query(() => Scan, { name: 'public_scan' })
  async findPublicScan(
    @Args('id', { type: () => Int, nullable: true }) id?: number,
    @Args('slug', { type: () => String, nullable: true }) slug?: string
  ) {
    return await this.sequelize.transaction(async t => {
      return await this.scanService.findPublic(
        {
          scan_id: id,
          slug
        },
        t
      )
    })
  }

  @Mutation(() => Scan, { name: 'create_scan' })
  @UseGuards(TokenJwtGuard)
  async createScan(@GetUser() user: User, @Args('data') data: CreateScanDto) {
    const scan = await this.sequelize.transaction(async t => {
      return await this.scanService.create({ data, user }, t)
    })

    this.activityService.create({
      type: 'scan',
      event: new ScanActivityEvent({
        scan_id: scan.scan_id,
        type: 'created'
      })
    })

    this.notificationService.send({
      type: 'SCAN_CREATED',
      title: `You Scan ${scan.name} has been submitted for processing.`,
      metadata: {
        scan_id: scan.scan_id,
        slug: scan.slug,
        thumbnail: scan.input_file.thumbnail
      },
      user_id: user.user_id
    })

    return scan
  }

  @Mutation(() => Scan, { name: 'update_scan' })
  @UseGuards(TokenJwtGuard)
  async updateScan(
    @GetUser() user: User,
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateScanDto
  ) {
    const scan = await this.sequelize.transaction(async t => {
      await this.scanService.findOne({ user_id: user.user_id, scan_id: id }, t)

      await this.scanService.update({ id, data }, t)

      return await this.scanService.findOne(
        {
          scan_id: id,
          user_id: user.user_id
        },
        t
      )
    })

    this.activityService.create({
      type: 'scan',
      event: new ScanActivityEvent({
        scan_id: id,
        type: 'updated'
      })
    })

    return scan
  }

  @Mutation(() => Scan, { name: 'delete_scan' })
  @UseGuards(TokenJwtGuard)
  async deleteScan(
    @GetUser() user: User,
    @Args('id', { type: () => Int }) id: number
  ) {
    return await this.sequelize.transaction(async t => {
      const scan = await this.scanService.findOne(
        {
          user_id: user.user_id,
          scan_id: id
        },
        t
      )

      await this.scanService.delete({ scan }, t)

      return scan
    })
  }
}
