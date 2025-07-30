export class ScanActivityEvent {
  constructor(
    readonly data: { scan_id: number; type: 'created' | 'updated' }
  ) {}
}
