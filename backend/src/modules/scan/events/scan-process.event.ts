import { type Scan } from '@/models'

export class ScanProcessEvent {
  constructor(readonly data: Pick<Scan, 'scan_id' | 'input_file'>) {}
}
