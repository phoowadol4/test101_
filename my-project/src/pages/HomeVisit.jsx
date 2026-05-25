import { useCallback, useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Swal from 'sweetalert2';
import Sidebar from '../components/Sidebar';
import {
  CheckboxGroup,
  Field,
  Input,
  RadioGroup,
  Section,
  Textarea,
} from '../components/homeVisit/FormControls';
import HomeVisitPrintTemplate from '../components/homeVisit/HomeVisitPrintTemplate';
import {
  ASSISTANCE_OPTIONS,
  createEmptyForm,
  createStudent,
  FAMILY_STATUS_OPTIONS,
  getCurrentAcademicYear,
  HOUSING_TYPE_OPTIONS,
  MAX_FORMS_PER_YEAR,
  RESIDENCE_OPTIONS,
  SCHOOL_CONFIG,
  STUDENT_GROUP_OPTIONS,
  TITLE_PREFIXES,
  TRANSPORT_OPTIONS,
} from '../constants/homeVisitForm';
import { exportHomeVisitPdf } from '../utils/exportHomeVisitPdf';
import {
  deleteStudent,
  getForm,
  getFormsForStudentYear,
  getStudents,
  getUsedSlots,
  saveForm,
  saveStudent,
} from '../utils/homeVisitStorage';

function updateForm(setForm, key, value) {
  setForm((prev) => ({ ...prev, [key]: value }));
}

export default function HomeVisit() {
  const { user } = useOutletContext() ?? {};
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [formSlot, setFormSlot] = useState(1);
  const [form, setForm] = useState(createEmptyForm());
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const printRef = useRef(null);

  const refreshStudents = useCallback(() => {
    setStudents(getStudents());
  }, []);

  useEffect(() => {
    refreshStudents();
  }, [refreshStudents]);

  useEffect(() => {
    if (!selectedStudentId) {
      setForm(createEmptyForm());
      return;
    }
    const saved = getForm(selectedStudentId, academicYear, formSlot);
    setForm(saved ? { ...createEmptyForm(), ...saved } : createEmptyForm());
  }, [selectedStudentId, academicYear, formSlot]);

  const usedSlots = selectedStudentId ? getUsedSlots(selectedStudentId, academicYear) : [];
  const yearForms = selectedStudentId ? getFormsForStudentYear(selectedStudentId, academicYear) : [];

  const handleAddStudent = async () => {
    const { value: name } = await Swal.fire({
      title: 'เพิ่มนักเรียน',
      input: 'text',
      inputLabel: 'ชื่อ-นามสกุลนักเรียน',
      inputPlaceholder: 'เช่น เด็กชายสมชาย ใจดี',
      showCancelButton: true,
      confirmButtonText: 'เพิ่ม',
      cancelButtonText: 'ยกเลิก',
    });
    if (!name?.trim()) return;
    const student = createStudent(`stu_${Date.now()}`, name.trim());
    saveStudent(student);
    refreshStudents();
    setSelectedStudentId(student.id);
    Swal.fire({ icon: 'success', title: 'เพิ่มนักเรียนแล้ว', timer: 1500, showConfirmButton: false });
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudentId) return;
    const result = await Swal.fire({
      title: 'ลบนักเรียน?',
      text: 'แบบฟอร์มทั้งหมดของนักเรียนคนนี้จะถูกลบ',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    });
    if (!result.isConfirmed) return;
    deleteStudent(selectedStudentId);
    refreshStudents();
    setSelectedStudentId('');
    Swal.fire({ icon: 'success', title: 'ลบแล้ว', timer: 1200, showConfirmButton: false });
  };

  const handleSave = () => {
    if (!selectedStudentId) {
      Swal.fire({ icon: 'warning', title: 'กรุณาเลือกนักเรียน' });
      return;
    }
    if (!form.studentName?.trim()) {
      Swal.fire({ icon: 'warning', title: 'กรุณากรอกชื่อนักเรียน' });
      return;
    }
    setSaving(true);
    try {
      saveForm({
        studentId: selectedStudentId,
        academicYear,
        formSlot,
        ...form,
      });
      const stu = students.find((s) => s.id === selectedStudentId);
      if (stu && form.studentName?.trim()) {
        saveStudent({
          ...stu,
          displayName: [form.titlePrefix, form.studentName].filter(Boolean).join(' '),
        });
      }
      refreshStudents();
      Swal.fire({ icon: 'success', title: 'บันทึกแบบฟอร์มแล้ว', timer: 1500, showConfirmButton: false });
    } catch (e) {
      Swal.fire({ icon: 'error', title: e.message || 'บันทึกไม่สำเร็จ' });
    } finally {
      setSaving(false);
    }
  };

  const handleExportPdf = async () => {
    if (!selectedStudentId) {
      Swal.fire({ icon: 'warning', title: 'กรุณาเลือกนักเรียนและบันทึกก่อนส่งออก' });
      return;
    }
    setExporting(true);
    const el = printRef.current;
    const name = form.studentName || 'นักเรียน';
    const filename = `เยี่ยมบ้าน_${name}_ปี${academicYear}_ครั้ง${formSlot}.pdf`;
    try {
      const ok = await exportHomeVisitPdf(el, filename);
      if (!ok) {
        Swal.fire({
          icon: 'info',
          title: 'พิมพ์ / บันทึกเป็น PDF',
          text: 'เลือก "Microsoft Print to PDF" หรือ "Save as PDF" ในหน้าต่างพิมพ์',
        });
      }
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'ส่งออกไม่สำเร็จ', text: e.message });
    } finally {
      setExporting(false);
    }
  };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'warning', title: 'รูปภาพต้องไม่เกิน 5 MB' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateForm(setForm, 'visitPhoto', reader.result);
    reader.readAsDataURL(file);
  };

  const set = (key) => (e) => updateForm(setForm, key, e.target?.value ?? e);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div className="h-screen w-full bg-[#f4f6f9] flex overflow-hidden font-['Sarabun',sans-serif]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden bg-white/90 backdrop-blur shadow-sm p-4 flex items-center justify-between flex-shrink-0 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-slate-100"
            aria-label="เปิดเมนู"
          >
            <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-slate-800">เยี่ยมบ้านนักเรียน</h1>
          <div className="w-10" />
        </header>

        <main className="flex-1 overflow-y-auto">
          {/* Hero */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white px-4 lg:px-8 py-8 lg:py-10">
            <div className="max-w-5xl mx-auto">
              <p className="text-indigo-300 text-sm font-medium tracking-wide uppercase">โรงเรียนวัดหนองโพรง</p>
              <h1 className="text-2xl lg:text-3xl font-bold mt-1">{SCHOOL_CONFIG.title}</h1>
              <p className="text-slate-300 mt-2 text-sm lg:text-base max-w-2xl">
                บันทึกได้สูงสุด {MAX_FORMS_PER_YEAR} แบบฟอร์มต่อนักเรียนต่อปีการศึกษา · รองรับมือถือและ PC · ส่งออก PDF ตามแบบฟอร์มราชการ
              </p>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6 lg:py-8 space-y-6 pb-24">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 lg:p-5 sticky top-0 z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <Field label="นักเรียน">
                  <select
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                  >
                    <option value="">— เลือกนักเรียน —</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.displayName}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="ปีการศึกษา (พ.ศ.)">
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="2568"
                  />
                </Field>
                <Field label={`แบบฟอร์ม (1–${MAX_FORMS_PER_YEAR})`}>
                  <div className="flex gap-2">
                    {[1, 2].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setFormSlot(slot)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition ${
                          formSlot === slot
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        ครั้งที่ {slot}
                        {usedSlots.includes(slot) && (
                          <span className="block text-[10px] opacity-80">มีข้อมูล</span>
                        )}
                      </button>
                    ))}
                  </div>
                </Field>
                <div className="flex flex-col justify-end gap-2 sm:col-span-2 lg:col-span-1">
                  <button
                    type="button"
                    onClick={handleAddStudent}
                    className="w-full py-2.5 rounded-xl border border-dashed border-indigo-300 text-indigo-700 text-sm font-medium hover:bg-indigo-50 transition"
                  >
                    + เพิ่มนักเรียน
                  </button>
                </div>
              </div>

              {selectedStudent && (
                <p className="text-xs text-slate-500 mb-3">
                  ปี {academicYear}: บันทึกแล้ว {yearForms.length}/{MAX_FORMS_PER_YEAR} แบบฟอร์ม
                  {yearForms.length >= MAX_FORMS_PER_YEAR && ' (ครบแล้ว — แก้ไขได้ตามครั้งที่เลือก)'}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !selectedStudentId}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={exporting || !selectedStudentId}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50 transition"
                >
                  {exporting ? 'กำลังส่งออก...' : 'ส่งออก PDF'}
                </button>
                {selectedStudentId && (
                  <button
                    type="button"
                    onClick={handleDeleteStudent}
                    className="px-4 py-2.5 rounded-xl text-red-600 text-sm hover:bg-red-50 transition"
                  >
                    ลบนักเรียน
                  </button>
                )}
              </div>
            </div>

            {!selectedStudentId ? (
              <div className="text-center py-16 text-slate-500">
                <p className="text-4xl mb-3">📋</p>
                <p>เลือกหรือเพิ่มนักเรียนเพื่อเริ่มกรอกแบบฟอร์ม</p>
              </div>
            ) : (
              <div className="space-y-5">
                <Section title="ข้อมูลนักเรียน" subtitle="ข้อมูลส่วนตัวและที่อยู่">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Field label="คำนำหน้า">
                      <select
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50"
                        value={form.titlePrefix}
                        onChange={set('titlePrefix')}
                      >
                        {TITLE_PREFIXES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="ชื่อ-นามสกุล" className="sm:col-span-2">
                      <Input value={form.studentName} onChange={set('studentName')} placeholder="ชื่อนักเรียน" />
                    </Field>
                    <Field label="ชั้น">
                      <Input value={form.className} onChange={set('className')} placeholder="เช่น ป.6/1" />
                    </Field>
                    <Field label="เลขที่">
                      <Input value={form.studentNumber} onChange={set('studentNumber')} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {[
                      ['houseNo', 'บ้านเลขที่'],
                      ['moo', 'หมู่ที่'],
                      ['soi', 'ซอย'],
                      ['road', 'ถนน'],
                      ['subdistrict', 'ตำบล'],
                      ['district', 'อำเภอ'],
                      ['province', 'จังหวัด'],
                      ['postalCode', 'รหัสไปรษณีย์'],
                      ['phone', 'โทรศัพท์'],
                    ].map(([key, label]) => (
                      <Field key={key} label={label}>
                        <Input value={form[key]} onChange={set(key)} />
                      </Field>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="ชื่อบิดา">
                      <Input value={form.fatherName} onChange={set('fatherName')} />
                    </Field>
                    <Field label="อาชีพบิดา">
                      <Input value={form.fatherOccupation} onChange={set('fatherOccupation')} />
                    </Field>
                    <Field label="ชื่อมารดา">
                      <Input value={form.motherName} onChange={set('motherName')} />
                    </Field>
                    <Field label="อาชีพมารดา">
                      <Input value={form.motherOccupation} onChange={set('motherOccupation')} />
                    </Field>
                    <Field label="ชื่อผู้ปกครอง">
                      <Input value={form.guardianName} onChange={set('guardianName')} />
                    </Field>
                    <Field label="อาชีพผู้ปกครอง">
                      <Input value={form.guardianOccupation} onChange={set('guardianOccupation')} />
                    </Field>
                  </div>
                  <Field label="สถานภาพครอบครัว">
                    <CheckboxGroup
                      options={FAMILY_STATUS_OPTIONS}
                      value={form.familyStatus}
                      onChange={(v) => updateForm(setForm, 'familyStatus', v)}
                    />
                  </Field>
                </Section>

                <Section title="ข้อมูลการเยี่ยมบ้าน" subtitle="วันเวลา การเดินทาง และลักษณะที่อยู่อาศัย">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Field label="วันที่">
                      <Input value={form.visitDay} onChange={set('visitDay')} placeholder="เช่น 15" />
                    </Field>
                    <Field label="เดือน">
                      <Input value={form.visitMonth} onChange={set('visitMonth')} />
                    </Field>
                    <Field label="พ.ศ.">
                      <Input value={form.visitYear} onChange={set('visitYear')} />
                    </Field>
                    <Field label="เวลา">
                      <Input type="time" value={form.visitTime} onChange={set('visitTime')} />
                    </Field>
                  </div>
                  <Field label="การเดินทางไปเยี่ยมบ้าน">
                    <CheckboxGroup
                      options={TRANSPORT_OPTIONS}
                      value={form.transport}
                      onChange={(v) => updateForm(setForm, 'transport', v)}
                      otherValue={form.transportOther}
                      onOtherChange={(v) => updateForm(setForm, 'transportOther', v)}
                    />
                  </Field>
                  <Field label="ลักษณะที่อยู่อาศัย">
                    <CheckboxGroup
                      options={HOUSING_TYPE_OPTIONS}
                      value={form.housingType}
                      onChange={(v) => updateForm(setForm, 'housingType', v)}
                      otherValue={form.housingOther}
                      onOtherChange={(v) => updateForm(setForm, 'housingOther', v)}
                    />
                  </Field>
                  <Field label="สถานที่พักอาศัย">
                    <CheckboxGroup
                      options={RESIDENCE_OPTIONS}
                      value={form.residence}
                      onChange={(v) => updateForm(setForm, 'residence', v)}
                      otherValue={form.residenceOther}
                      onOtherChange={(v) => updateForm(setForm, 'residenceOther', v)}
                    />
                  </Field>
                  <Field label="จัดกลุ่มนักเรียน">
                    <RadioGroup
                      options={STUDENT_GROUP_OPTIONS}
                      value={form.studentGroup}
                      onChange={(v) => updateForm(setForm, 'studentGroup', v)}
                    />
                    <Input
                      className="mt-2"
                      placeholder="เพื่อส่งเสริมศักยภาพในเรื่อง..."
                      value={form.studentGroupDetail}
                      onChange={set('studentGroupDetail')}
                    />
                  </Field>
                  <Field label="วัตถุประสงค์การเยี่ยมบ้าน">
                    <Textarea value={form.visitPurpose} onChange={set('visitPurpose')} rows={2} />
                  </Field>
                </Section>

                <Section title="การสังเกตและพฤติกรรม" subtitle="สภาพครอบครัวและพฤติกรรมที่โรงเรียน">
                  {[
                    ['familyCondition', 'สภาพครอบครัวโดยทั่วไป'],
                    ['problemsAtHome', 'ปัญหา/สภาพขณะนักเรียนอยู่บ้าน'],
                    ['goodBehavior', 'พฤติกรรมด้านดี'],
                    ['needImproveBehavior', 'พฤติกรรมที่ควรปรับปรุง'],
                  ].map(([key, label]) => (
                    <Field key={key} label={label}>
                      <Textarea value={form[key]} onChange={set(key)} rows={4} />
                    </Field>
                  ))}
                </Section>

                <Section title="การประเมินและความช่วยเหลือ" subtitle="หน้า 2 ของแบบฟอร์ม">
                  {[
                    ['problemSolutions', 'ปัญหา/แนวทางร่วมแก้ไข'],
                    ['developmentAreas', 'สิ่งที่นักเรียนควรพัฒนา'],
                    ['parentOpinion', 'ความคิดเห็นผู้ปกครอง'],
                    ['teacherOpinion', 'ความคิดเห็นครูประจำชั้น'],
                  ].map(([key, label]) => (
                    <Field key={key} label={label}>
                      <Textarea value={form[key]} onChange={set(key)} rows={4} />
                    </Field>
                  ))}
                  <Field label="การให้ความช่วยเหลือ">
                    <CheckboxGroup
                      options={ASSISTANCE_OPTIONS}
                      value={form.assistance}
                      onChange={(v) => updateForm(setForm, 'assistance', v)}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                      {form.assistance?.includes('advice') && (
                        <Input
                          placeholder="ให้คำแนะนำเรื่อง..."
                          value={form.assistanceAdvice}
                          onChange={set('assistanceAdvice')}
                        />
                      )}
                      {form.assistance?.includes('scholarship') && (
                        <Input
                          placeholder="ทุนการศึกษา..."
                          value={form.assistanceScholarship}
                          onChange={set('assistanceScholarship')}
                        />
                      )}
                      {form.assistance?.includes('job') && (
                        <Input placeholder="งาน..." value={form.assistanceJob} onChange={set('assistanceJob')} />
                      )}
                      {form.assistance?.includes('coordinate') && (
                        <Input
                          placeholder="ประสานเรื่อง..."
                          value={form.assistanceCoordinate}
                          onChange={set('assistanceCoordinate')}
                        />
                      )}
                      {form.assistance?.includes('other') && (
                        <Input
                          placeholder="อื่นๆ..."
                          value={form.assistanceOther}
                          onChange={set('assistanceOther')}
                        />
                      )}
                    </div>
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="ชื่อผู้ปกครอง (สำหรับลายเซ็น)">
                      <Input value={form.parentPrintedName} onChange={set('parentPrintedName')} />
                    </Field>
                    <Field label="ชื่อครูประจำชั้น (สำหรับลายเซ็น)">
                      <Input value={form.teacherPrintedName} onChange={set('teacherPrintedName')} />
                    </Field>
                  </div>
                  <Field label="รูปภาพการเยี่ยมบ้าน">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhoto}
                      className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-medium"
                    />
                    {form.visitPhoto && (
                      <img
                        src={form.visitPhoto}
                        alt="ตัวอย่างรูป"
                        className="mt-3 max-h-48 rounded-xl border border-slate-200 object-cover"
                      />
                    )}
                  </Field>
                </Section>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Hidden print / PDF template */}
      <div
        ref={printRef}
        className="fixed left-[-9999px] top-0 pointer-events-none"
        aria-hidden="true"
      >
        <HomeVisitPrintTemplate data={form} />
      </div>

      <style>{`
        @media print {
          body.home-visit-print-mode * { visibility: hidden !important; }
          body.home-visit-print-mode #home-visit-print-root,
          body.home-visit-print-mode #home-visit-print-root * {
            visibility: visible !important;
          }
          body.home-visit-print-mode #home-visit-print-root {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: auto !important;
            opacity: 1 !important;
          }
          body.home-visit-print-mode .hv-page {
            page-break-after: always;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
