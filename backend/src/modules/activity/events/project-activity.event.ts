export class ProjectActivityEvent {
  constructor(
    readonly data: { project_id: number; type: 'created' | 'updated' }
  ) {}
}
