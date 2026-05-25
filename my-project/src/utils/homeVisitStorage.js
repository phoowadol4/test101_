import { MAX_FORMS_PER_YEAR } from '../constants/homeVisitForm';

const STORAGE_KEY = 'homeVisitData_v1';

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { students: [], forms: [] };
    return JSON.parse(raw);
  } catch {
    return { students: [], forms: [] };
  }
}

function writeStore(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getStudents() {
  return readStore().students;
}

export function saveStudent(student) {
  const store = readStore();
  const idx = store.students.findIndex((s) => s.id === student.id);
  if (idx >= 0) store.students[idx] = student;
  else store.students.push(student);
  writeStore(store);
  return student;
}

export function deleteStudent(studentId) {
  const store = readStore();
  store.students = store.students.filter((s) => s.id !== studentId);
  store.forms = store.forms.filter((f) => f.studentId !== studentId);
  writeStore(store);
}

export function getFormKey(studentId, academicYear, formSlot) {
  return `${studentId}_${academicYear}_${formSlot}`;
}

export function getForm(studentId, academicYear, formSlot) {
  const store = readStore();
  return store.forms.find(
    (f) =>
      f.studentId === studentId &&
      f.academicYear === academicYear &&
      f.formSlot === formSlot
  );
}

export function getFormsForStudentYear(studentId, academicYear) {
  const store = readStore();
  return store.forms
    .filter((f) => f.studentId === studentId && f.academicYear === academicYear)
    .sort((a, b) => a.formSlot - b.formSlot);
}

export function getUsedSlots(studentId, academicYear) {
  return getFormsForStudentYear(studentId, academicYear).map((f) => f.formSlot);
}

export function canCreateForm(studentId, academicYear, formSlot) {
  if (formSlot < 1 || formSlot > MAX_FORMS_PER_YEAR) return false;
  const existing = getForm(studentId, academicYear, formSlot);
  return !existing;
}

export function saveForm(record) {
  const store = readStore();
  const idx = store.forms.findIndex(
    (f) =>
      f.studentId === record.studentId &&
      f.academicYear === record.academicYear &&
      f.formSlot === record.formSlot
  );
  const payload = { ...record, updatedAt: new Date().toISOString() };
  if (idx >= 0) store.forms[idx] = payload;
  else {
    const count = store.forms.filter(
      (f) => f.studentId === record.studentId && f.academicYear === record.academicYear
    ).length;
    if (count >= MAX_FORMS_PER_YEAR && idx < 0) {
      throw new Error('ครบ 2 แบบฟอร์มต่อปีการศึกษาแล้ว');
    }
    store.forms.push(payload);
  }
  writeStore(store);
  return payload;
}

export function listStudentFormSummary(studentId) {
  const store = readStore();
  const byYear = {};
  store.forms
    .filter((f) => f.studentId === studentId)
    .forEach((f) => {
      if (!byYear[f.academicYear]) byYear[f.academicYear] = [];
      byYear[f.academicYear].push(f.formSlot);
    });
  return byYear;
}
