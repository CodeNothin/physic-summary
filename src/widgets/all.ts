// Registers every widget. Imported once from main.tsx.
import { widgets } from './registry';
import { PointField } from './PointField';
import { FluxTilt } from './FluxTilt';
import { GaussCharges } from './GaussCharges';
import { SphereExplorer } from './SphereExplorer';
import { ChargedSheets } from './ChargedSheets';
import { HollowConductor } from './HollowConductor';
import { BallShell } from './BallShell';
import { UniformField } from './UniformField';
import { ChargeSandbox } from './ChargeSandbox';
import { RingAxis } from './RingAxis';
import { TwoSpheres } from './TwoSpheres';

widgets.twoSpheres = { title: 'ทรงกลมต่อลวด', C: TwoSpheres };
widgets.ring = { title: 'วงแหวน', C: RingAxis };
widgets.sandbox = { title: 'จุดประจุ', C: ChargeSandbox };
widgets.uniform = { title: 'สนามสม่ำเสมอ', C: UniformField };
widgets.ballShell = { title: 'ฉนวนในเปลือกตัวนำ', C: BallShell };
widgets.pointField = { title: 'สนามของจุดประจุ', C: PointField };
widgets.flux = { title: 'ฟลักซ์', C: FluxTilt };
widgets.gauss = { title: 'กฎของเกาส์', C: GaussCharges };
widgets.sphere = { title: 'ทรงกลมประจุ', C: SphereExplorer };
widgets.sheets = { title: 'แผ่นประจุ', C: ChargedSheets };
widgets.hollow = { title: 'ตัวนำกลวง', C: HollowConductor };
