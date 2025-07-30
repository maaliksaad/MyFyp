import { SequelizeModule } from '@nestjs/sequelize'

export const createModelStub = (...entities: any) => {
  return [
    SequelizeModule.forRoot({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      define: {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      },
      autoLoadModels: true
    }),
    SequelizeModule.forFeature(entities)
  ]
}
