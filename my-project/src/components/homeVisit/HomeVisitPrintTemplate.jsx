import '../../styles/homeVisitPrint.css';
import {
  ASSISTANCE_OPTIONS,
  FAMILY_STATUS_OPTIONS,
  HOUSING_TYPE_OPTIONS,
  RESIDENCE_OPTIONS,
  SCHOOL_CONFIG,
  STUDENT_GROUP_OPTIONS,
  TRANSPORT_OPTIONS,
} from '../../constants/homeVisitForm';

function Check({ checked, label }) {
  return (
    <span className="hv-check">
      <span className="hv-check-box">{checked ? '✓' : ''}</span>
      <span>{label}</span>
    </span>
  );
}

function Line({ value = '', className = 'hv-line--grow' }) {
  return <span className={`hv-line ${className}`}>{value || '\u00a0'}</span>;
}

function Row({ children }) {
  return <div className="hv-row">{children}</div>;
}

function Lbl({ children }) {
  return <span className="hv-lbl">{children}</span>;
}

function MultiLine({ value = '', lines = 3 }) {
  const parts = (value || '').split('\n');
  while (parts.length < lines) parts.push('');
  return (
    <div className="hv-multiline">
      {parts.slice(0, lines).map((line, i) => (
        <div key={i} className="hv-multiline-line">
          {line || '\u00a0'}
        </div>
      ))}
    </div>
  );
}

function CheckBlock({ label, children }) {
  return (
    <div className="hv-check-block">
      {label && <span className="hv-check-label">{label}</span>}
      <div className="hv-check-row">{children}</div>
    </div>
  );
}

function Page({ pageNum, children }) {
  return (
    <div data-pdf-page={pageNum} className="hv-page">
      {children}
    </div>
  );
}

export default function HomeVisitPrintTemplate({ data }) {
  const d = data || {};
  const fullName = [d.titlePrefix, d.studentName].filter(Boolean).join(' ');

  const hasTransport = (key) => (d.transport || []).includes(key);
  const hasHousing = (key) => (d.housingType || []).includes(key);
  const hasResidence = (key) => (d.residence || []).includes(key);
  const hasFamily = (key) => (d.familyStatus || []).includes(key);
  const hasAssist = (key) => (d.assistance || []).includes(key);

  return (
    <div id="home-visit-print-root" className="hv-print-root">
      <Page pageNum={1}>
        <div className="hv-header">
          <p className="hv-header-title">{SCHOOL_CONFIG.title}</p>
          <p className="hv-header-sub">{SCHOOL_CONFIG.school}</p>
          <p className="hv-header-sub">{SCHOOL_CONFIG.office}</p>
        </div>

        <Row>
          <Lbl>ชื่อ</Lbl>
          <Line value={fullName} className="hv-line--grow" />
          <Lbl>ชั้น</Lbl>
          <Line value={d.className} className="hv-line--sm" />
          <Lbl>เลขที่</Lbl>
          <Line value={d.studentNumber} className="hv-line--xs" />
        </Row>

        <Row>
          <Lbl>ที่อยู่ บ้านเลขที่</Lbl>
          <Line value={d.houseNo} className="hv-line--sm" />
          <Lbl>หมู่ที่</Lbl>
          <Line value={d.moo} className="hv-line--xs" />
          <Lbl>ซอย</Lbl>
          <Line value={d.soi} className="hv-line--md" />
          <Lbl>ถนน</Lbl>
          <Line value={d.road} className="hv-line--grow" />
        </Row>

        <Row>
          <Lbl>ตำบล</Lbl>
          <Line value={d.subdistrict} className="hv-line--md" />
          <Lbl>อำเภอ</Lbl>
          <Line value={d.district} className="hv-line--md" />
          <Lbl>จังหวัด</Lbl>
          <Line value={d.province} className="hv-line--md" />
          <Lbl>รหัสไปรษณีย์</Lbl>
          <Line value={d.postalCode} className="hv-line--sm" />
          <Lbl>โทรศัพท์</Lbl>
          <Line value={d.phone} className="hv-line--lg" />
        </Row>

        <Row>
          <Lbl>ชื่อบิดา</Lbl>
          <Line value={d.fatherName} className="hv-line--grow" />
          <Lbl>อาชีพ</Lbl>
          <Line value={d.fatherOccupation} className="hv-line--lg" />
        </Row>

        <Row>
          <Lbl>ชื่อมารดา</Lbl>
          <Line value={d.motherName} className="hv-line--grow" />
          <Lbl>อาชีพ</Lbl>
          <Line value={d.motherOccupation} className="hv-line--lg" />
        </Row>

        <Row>
          <Lbl>ชื่อผู้ปกครอง</Lbl>
          <Line value={d.guardianName} className="hv-line--grow" />
          <Lbl>อาชีพ</Lbl>
          <Line value={d.guardianOccupation} className="hv-line--lg" />
        </Row>

        <CheckBlock label="สถานภาพครอบครัว">
          {FAMILY_STATUS_OPTIONS.map((o) => (
            <Check key={o.key} checked={hasFamily(o.key)} label={o.label} />
          ))}
        </CheckBlock>

        <p className="hv-section-title">ข้อมูลการเยี่ยมบ้านนักเรียน</p>

        <Row>
          <Lbl>วันที่เยี่ยม วันที่</Lbl>
          <Line value={d.visitDay} className="hv-line--xs" />
          <Lbl>เดือน</Lbl>
          <Line value={d.visitMonth} className="hv-line--md" />
          <Lbl>พ.ศ.</Lbl>
          <Line value={d.visitYear} className="hv-line--sm" />
          <Lbl>เวลา</Lbl>
          <Line value={d.visitTime} className="hv-line--sm" />
          <Lbl>น.</Lbl>
        </Row>

        <CheckBlock label="การเดินทางไปเยี่ยมบ้าน">
          {TRANSPORT_OPTIONS.map((o) => (
            <Check key={o.key} checked={hasTransport(o.key)} label={o.label} />
          ))}
          {hasTransport('other') && (
            <>
              <Lbl>ระบุ</Lbl>
              <Line value={d.transportOther} className="hv-line--lg" />
            </>
          )}
        </CheckBlock>

        <CheckBlock label="ลักษณะที่อยู่อาศัย">
          {HOUSING_TYPE_OPTIONS.map((o) => (
            <Check key={o.key} checked={hasHousing(o.key)} label={o.label} />
          ))}
          {hasHousing('other') && (
            <>
              <Lbl>ระบุ</Lbl>
              <Line value={d.housingOther} className="hv-line--md" />
            </>
          )}
        </CheckBlock>

        <CheckBlock label="สถานที่พักอาศัย">
          {RESIDENCE_OPTIONS.map((o) => (
            <Check key={o.key} checked={hasResidence(o.key)} label={o.label} />
          ))}
          {hasResidence('other') && (
            <>
              <Lbl>ระบุ</Lbl>
              <Line value={d.residenceOther} className="hv-line--md" />
            </>
          )}
        </CheckBlock>

        <CheckBlock label="จัดกลุ่มนักเรียน">
          {STUDENT_GROUP_OPTIONS.map((o) => (
            <Check key={o.key} checked={d.studentGroup === o.key} label={o.label} />
          ))}
          <Lbl>เพื่อส่งเสริมศักยภาพในเรื่อง</Lbl>
          <Line value={d.studentGroupDetail} className="hv-line--grow" />
        </CheckBlock>

        <p className="hv-block-label">วัตถุประสงค์การเยี่ยมบ้าน</p>
        <MultiLine value={d.visitPurpose} lines={1} />

        <p className="hv-block-label">สภาพครอบครัวโดยทั่วไป</p>
        <MultiLine value={d.familyCondition} lines={3} />

        <p className="hv-block-label">ปัญหา/สภาพขณะนักเรียนอยู่บ้าน</p>
        <MultiLine value={d.problemsAtHome} lines={3} />

        <p className="hv-block-label">พฤติกรรมของนักเรียนขณะอยู่โรงเรียน</p>
        <p className="hv-block-label" style={{ marginTop: 2 }}>
          ด้านดี
        </p>
        <MultiLine value={d.goodBehavior} lines={3} />
        <p className="hv-block-label" style={{ marginTop: 2 }}>
          ด้านที่ควรปรับปรุง
        </p>
        <MultiLine value={d.needImproveBehavior} lines={3} />
      </Page>

      <Page pageNum={2}>
        <p className="hv-block-label">ปัญหา/แนวทางร่วมแก้ไขระหว่างครูประจำชั้นกับผู้ปกครอง</p>
        <MultiLine value={d.problemSolutions} lines={3} />

        <p className="hv-block-label">สิ่งที่นักเรียนควรพัฒนา</p>
        <MultiLine value={d.developmentAreas} lines={3} />

        <p className="hv-block-label">ความคิดเห็นผู้ปกครอง</p>
        <MultiLine value={d.parentOpinion} lines={3} />

        <p className="hv-section-title">การให้ความช่วยเหลือ</p>

        <div className="hv-row hv-row--assist">
          <Check checked={hasAssist('advice')} label="ให้คำแนะนำเรื่อง" />
          <Line value={d.assistanceAdvice} className="hv-line--grow" />
        </div>
        <div className="hv-row hv-row--assist">
          <Check checked={hasAssist('scholarship')} label="ให้ทุนการศึกษา" />
          <Line value={d.assistanceScholarship} className="hv-line--grow" />
        </div>
        <div className="hv-row hv-row--assist">
          <Check checked={hasAssist('job')} label="ให้งาน" />
          <Line value={d.assistanceJob} className="hv-line--grow" />
        </div>
        <div className="hv-row hv-row--assist">
          <Check checked={hasAssist('coordinate')} label="ประสานแก้ไขปัญหา" />
          <Line value={d.assistanceCoordinate} className="hv-line--grow" />
        </div>
        <div className="hv-row hv-row--assist">
          <Check checked={hasAssist('other')} label="อื่นๆ" />
          <Line value={d.assistanceOther} className="hv-line--grow" />
        </div>

        <p className="hv-block-label">ความคิดเห็นครูที่ปรึกษา/ครูประจำชั้น</p>
        <MultiLine value={d.teacherOpinion} lines={3} />

        <div className="hv-signatures">
          <div className="hv-sign">
            <p className="hv-sign-line">ลงชื่อ...............................................ผู้ปกครอง</p>
            <div className="hv-sign-name">
              <Lbl>(</Lbl>
              <Line value={d.parentPrintedName || d.parentSignature} className="hv-line--lg" />
              <Lbl>)</Lbl>
            </div>
          </div>
          <div className="hv-sign">
            <p className="hv-sign-line">ลงชื่อ...............................................ครูประจำชั้น</p>
            <div className="hv-sign-name">
              <Lbl>(</Lbl>
              <Line value={d.teacherPrintedName || d.teacherSignature} className="hv-line--lg" />
              <Lbl>)</Lbl>
            </div>
          </div>
        </div>

        <div className="hv-photo">
          {d.visitPhoto ? (
            <img src={d.visitPhoto} alt="รูปเยี่ยมบ้าน" />
          ) : (
            <p className="hv-photo-placeholder">
              รูปภาพการเยี่ยมบ้านนักเรียน (ผู้ปกครอง นักเรียน และครูประจำชั้น)
            </p>
          )}
        </div>
      </Page>
    </div>
  );
}
