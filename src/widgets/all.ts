// =====================================================================
// Registers every widget under a short id.
//
// A page shows a widget with  <W id="flux" />  (see registry.tsx).
// The same id is used by the single-widget URL  #/w/<id>.
//
// To add a widget: write src/widgets/<Name>.tsx exporting a component,
// import it below, and add one line  widgets.<id> = { title, C }.
// This file is imported once, from main.tsx, before the app renders.
// =====================================================================
import { widgets } from './registry';

// ---- chapter 1: Gauss's law
import { PointField } from './PointField';
import { FluxTilt } from './FluxTilt';
import { GaussCharges } from './GaussCharges';
import { SphereExplorer } from './SphereExplorer';
import { ChargedSheets } from './ChargedSheets';
import { HollowConductor } from './HollowConductor';
import { BallShell } from './BallShell';

// ---- chapter 2: electric potential
import { UniformField } from './UniformField';
import { ChargeSandbox } from './ChargeSandbox';
import { RingAxis } from './RingAxis';
import { TwoSpheres } from './TwoSpheres';

// ---- chapter 3: Biot–Savart and Ampère
import { CrossDir } from './CrossDir';
import { ChargeInB } from './ChargeInB';
import { VelocitySelector } from './VelocitySelector';
import { Semicircle } from './Semicircle';
import { FiniteWire } from './FiniteWire';
import { AmpereLoop } from './AmpereLoop';
import { ThickWire } from './ThickWire';
import { WiresInPage } from './WiresInPage';
import { WiresEndOn } from './WiresEndOn';
import { Solenoid } from './Solenoid';

widgets.pointField = { title: 'สนามของจุดประจุ', C: PointField };
widgets.flux = { title: 'ฟลักซ์', C: FluxTilt };
widgets.gauss = { title: 'กฎของเกาส์', C: GaussCharges };
widgets.sphere = { title: 'ทรงกลมประจุ', C: SphereExplorer };
widgets.sheets = { title: 'แผ่นประจุ', C: ChargedSheets };
widgets.hollow = { title: 'ตัวนำกลวง', C: HollowConductor };
widgets.ballShell = { title: 'ฉนวนในเปลือกตัวนำ', C: BallShell };

widgets.uniform = { title: 'สนามสม่ำเสมอ', C: UniformField };
widgets.sandbox = { title: 'จุดประจุ', C: ChargeSandbox };
widgets.ring = { title: 'วงแหวน', C: RingAxis };
widgets.twoSpheres = { title: 'ทรงกลมต่อลวด', C: TwoSpheres };

widgets.crossDir = { title: 'ทิศ v × B', C: CrossDir };
widgets.chargeInB = { title: 'ประจุในสนาม B', C: ChargeInB };
widgets.selector = { title: 'ตัวเลือกความเร็ว', C: VelocitySelector };
widgets.semicircle = { title: 'ลวดครึ่งวงกลม', C: Semicircle };
widgets.finiteWire = { title: 'บิโอต์–ซาวาร์ต', C: FiniteWire };
widgets.ampereLoop = { title: 'กฎของแอมแปร์', C: AmpereLoop };
widgets.thickWire = { title: 'ลวดหนา', C: ThickWire };
widgets.wiresInPage = { title: 'ลวดขนาน (สไลด์ 20)', C: WiresInPage };
widgets.wiresEndOn = { title: 'ลวดแนวแกน z (ข้อ 27)', C: WiresEndOn };
widgets.solenoid = { title: 'โซลีนอยด์', C: Solenoid };
