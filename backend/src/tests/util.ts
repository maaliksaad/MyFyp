import {
  createPopulatedFile,
  createPopulatedProject,
  createPopulatedScan,
  createPopulatedUser
} from '@/factories'
import { type File, type Project, type Scan, type User } from '@/models'

export const createAndSaveProject = async ({
  userModel,
  fileModel,
  projectModel
}: {
  userModel: typeof User
  fileModel: typeof File
  projectModel: typeof Project
}) => {
  const user = createPopulatedUser({ verified: true })
  await userModel.create({ ...user })

  const thumbnail = createPopulatedFile()
  await fileModel.create({ ...thumbnail })

  const project = createPopulatedProject({
    user_id: user.user_id,
    thumbnail_id: thumbnail.file_id
  })
  await projectModel.create({ ...project })

  return { user, thumbnail, project }
}

export const createAndSaveScan = async ({
  userModel,
  fileModel,
  projectModel,
  scanModel
}: {
  userModel: typeof User
  fileModel: typeof File
  projectModel: typeof Project
  scanModel: typeof Scan
}) => {
  const { project, user, thumbnail } = await createAndSaveProject({
    userModel,
    fileModel,
    projectModel
  })

  const file = createPopulatedFile()
  await fileModel.create({ ...file })

  const scan = createPopulatedScan({
    user_id: user.user_id,
    project_id: project.project_id,
    input_file_id: file.file_id
  })
  await scanModel.create({ ...scan })

  return { user, file, thumbnail, project, scan }
}
