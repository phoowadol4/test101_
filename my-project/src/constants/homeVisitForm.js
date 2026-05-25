export const SCHOOL_CONFIG = {
  title: 'แบบบันทึกการเยี่ยมบ้านนักเรียน',
  school: 'โรงเรียนวัดหนองโพรง จังหวัดปราจีนบุรี',
  office: 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษาปราจีนบุรี เขต 1',
};

export const TITLE_PREFIXES = ['นาย', 'นางสาว', 'เด็กชาย', 'เด็กหญิง'];

export const FAMILY_STATUS_OPTIONS = [
  { key: 'together', label: 'อยู่ด้วยกัน' },
  { key: 'divorced', label: 'หย่าร้าง' },
  { key: 'separated', label: 'แยกกันอยู่' },
];

export const TRANSPORT_OPTIONS = [
  { key: 'privateCar', label: 'รถยนต์ส่วนตัว' },
  { key: 'schoolBus', label: 'รถรับส่งนักเรียน' },
  { key: 'public', label: 'รถสาธารณะ' },
  { key: 'hired', label: 'รถจ้าง' },
  { key: 'walk', label: 'เดินเท้า' },
  { key: 'other', label: 'อื่นๆ' },
];

export const HOUSING_TYPE_OPTIONS = [
  { key: 'commercial', label: 'อาคารพาณิชย์' },
  { key: 'brick', label: 'บ้านครึ่งปูนครึ่งไม้' },
  { key: 'halfBrick', label: 'บ้านปูน' },
  { key: 'wood1', label: 'บ้านไม้ชั้นเดียว' },
  { key: 'wood2', label: 'บ้านไม้สองชั้น' },
  { key: 'other', label: 'อื่นๆ' },
];

export const RESIDENCE_OPTIONS = [
  { key: 'own', label: 'บ้านของตนเอง' },
  { key: 'rent', label: 'บ้านเช่า' },
  { key: 'flat', label: 'แฟลต' },
  { key: 'dorm', label: 'หอพัก' },
  { key: 'condo', label: 'คอนโด' },
  { key: 'rentRoom', label: 'ห้องเช่า' },
  { key: 'relative', label: 'บ้านญาติ' },
  { key: 'other', label: 'อื่นๆ' },
];

export const STUDENT_GROUP_OPTIONS = [
  { key: 'normal', label: 'กลุ่มปกติ' },
  { key: 'atRisk', label: 'กลุ่มเสี่ยง' },
  { key: 'problem', label: 'กลุ่มปัญหา' },
];

export const ASSISTANCE_OPTIONS = [
  { key: 'advice', label: 'ให้คำแนะนำเรื่อง' },
  { key: 'scholarship', label: 'ให้ทุนการศึกษา' },
  { key: 'job', label: 'ให้งาน' },
  { key: 'coordinate', label: 'ประสานแก้ไขปัญหา' },
  { key: 'other', label: 'อื่นๆ' },
];

export const MAX_FORMS_PER_YEAR = 2;

export function getCurrentAcademicYear() {
  const now = new Date();
  const year = now.getFullYear() + 543;
  const month = now.getMonth() + 1;
  return month >= 5 ? String(year) : String(year - 1);
}

export function createEmptyForm() {
  return {
    titlePrefix: 'เด็กชาย',
    studentName: '',
    className: '',
    studentNumber: '',
    houseNo: '',
    moo: '',
    soi: '',
    road: '',
    subdistrict: '',
    district: '',
    province: '',
    postalCode: '',
    phone: '',
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    motherOccupation: '',
    guardianName: '',
    guardianOccupation: '',
    familyStatus: [],
    visitDay: '',
    visitMonth: '',
    visitYear: '',
    visitTime: '',
    transport: [],
    transportOther: '',
    housingType: [],
    housingOther: '',
    residence: [],
    residenceOther: '',
    studentGroup: '',
    studentGroupDetail: '',
    visitPurpose: '',
    familyCondition: '',
    problemsAtHome: '',
    goodBehavior: '',
    needImproveBehavior: '',
    problemSolutions: '',
    developmentAreas: '',
    parentOpinion: '',
    assistance: [],
    assistanceAdvice: '',
    assistanceScholarship: '',
    assistanceJob: '',
    assistanceCoordinate: '',
    assistanceOther: '',
    teacherOpinion: '',
    parentSignature: '',
    parentPrintedName: '',
    teacherSignature: '',
    teacherPrintedName: '',
    visitPhoto: null,
    updatedAt: null,
  };
}

export function createStudent(id, name = '') {
  return {
    id,
    displayName: name,
    createdAt: new Date().toISOString(),
  };
}
