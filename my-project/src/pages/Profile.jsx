/**
 * หน้าข้อมูลส่วนตัว (Profile)
 *
 * ขั้นตอนโหลดข้อมูล (2 ขั้น):
 *   1) POST /authen  + Bearer token  → ได้ decoded.username (รู้ว่า login เป็นใคร)
 *   2) GET  /users   + Bearer token  → หาแถวใน results ที่ username ตรงกัน → แสดงข้อมูลจาก users
 *
 * ข้อมูลที่แสดงบนหน้ามาจากตาราง users เท่านั้น
 * authen ใช้แค่ยืนยัน token และเอา username ไปจับคู่
 */
import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Sidebar from '../components/Sidebar';

const API_AUTHEN = 'http://localhost:5555/authen';
const API_USERS = 'http://localhost:5555/users';

/**
 * ฟิลด์ในฟอร์ม — key ตรงกับ profile ที่ map จาก API แล้ว
 */
const PROFILE_FIELDS = [
  { key: 'first_name', label: 'ชื่อ', placeholder: 'กรอกชื่อ', icon: '👤', type: 'text' },
  { key: 'last_name', label: 'นามสกุล', placeholder: 'กรอกนามสกุล', icon: '👤', type: 'text' },
  { key: 'email', label: 'อีเมล', placeholder: 'example@email.com', icon: '✉️', type: 'email' },
  { key: 'phone', label: 'เบอร์โทรศัพท์', placeholder: '08x-xxx-xxxx', icon: '📱', type: 'tel' },
  { key: 'role_name', label: 'บทบาท', placeholder: 'เช่น Admin, User', icon: '💼', type: 'text' },
];

// ─── Helper functions ───────────────────────────────────────────────────────────

/** Header มาตรฐานเมื่อมี token */
function authHeaders(token, withJson = false) {
  return {
    ...(withJson ? { 'Content-Type': 'application/json' } : {}),
    Authorization: `Bearer ${token}`,
  };
}

/**
 * แปลงแถวจาก data.results (users API) เป็นรูปแบบที่หน้าใช้แสดง
 * name = first_name + last_name (ใช้แสดงบนการ์ดโปรไฟล์)
 */
function mapUserFromApi(userData) {
  if (!userData) return null;

  const first = userData.first_name ?? '';
  const last = userData.last_name ?? '';

  return {
    user_id: userData.user_id ?? '',
    username: userData.username ?? '',
    first_name: first,
    last_name: last,
    name: [first, last].filter(Boolean).join(' ') || userData.username || '',
    email: userData.email ?? '',
    role_name: userData.role_name ?? '',
    phone: userData.phone ?? '',
    img: userData.img ?? null,
    created_at: userData.created_at,
    updated_at: userData.updated_at,
    /** เก็บข้อมูลดิบจาก API ไว้ตอนบันทึก PUT */
    _raw: userData,
  };
}

/** สร้างค่าในฟอร์มจาก profile ที่ map แล้ว */
function buildFormFromProfile(profile) {
  const form = {};
  PROFILE_FIELDS.forEach(({ key }) => {
    form[key] = profile?.[key] ?? '';
  });
  return form;
}

/**
 * สร้าง body สำหรับ PUT — อิงโครงสร้างเดิมจาก _raw แล้วอัปเดตฟิลด์ที่แก้
 */
function buildSavePayload(profile, form) {
  const base = { ...(profile?._raw ?? {}) };
  return {
    ...base,
    first_name: form.first_name,
    last_name: form.last_name,
    email: form.email,
    phone: form.phone,
    role_name: form.role_name,
  };
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
}

function FieldIcon({ icon }) {
  return <span className="text-base leading-none">{icon}</span>;
}

// ─── Component หลัก ───────────────────────────────────────────────────────────

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);
  /** ข้อมูลที่ map จาก users แล้ว — ใช้แสดงทั้งหน้า */
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});

  const menuItems = [
    { icon: '🏠', label: 'หน้าแรก', path: '/' },
    { icon: '📊', label: 'ประวัติ', path: '/history' },
    { icon: '👤', label: 'ข้อมูลส่วนตัว', path: '/profile' },
    { icon: '⚙️', label: 'ตั้งค่า', path: '/settings' },
  ];

  /** ไม่มี token หรือ authen ไม่ผ่าน → ลบ token แล้วไป login */
  const handleAuthFailure = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  }, [navigate]);

  /**
   * Step 2: โหลดรายการ users แล้วหาแถวที่ username === loggedInUsername
   * loggedInUsername มาจาก authen.decoded.username (Step 1)
   */
  const fetchUserProfile = useCallback(
    async (token, loggedInUsername) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(API_USERS, {
          headers: authHeaders(token),
        });
        const data = await response.json();

        if (data.status !== 'ok' || !data.results) {
          throw new Error(data.message || 'โหลดข้อมูล users ไม่สำเร็จ');
        }

        const userData = data.results.find((user) => user.username === loggedInUsername);

        if (!userData) {
          throw new Error(`ไม่พบผู้ใช้ "${loggedInUsername}" ในตาราง users`);
        }

        const mapped = mapUserFromApi(userData);
        setProfile(mapped);
        setForm(buildFormFromProfile(mapped));
      } catch (err) {
        setProfile(null);
        setForm({});
        setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Step 1 + 2 รวมกัน:
   * - มี token → authen → ได้ username → fetchUserProfile
   * - ไม่มี token / authen fail → handleAuthFailure
   */
  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      handleAuthFailure();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const authenRes = await fetch(API_AUTHEN, {
        method: 'POST',
        headers: authHeaders(token, true),
      });
      const authenData = await authenRes.json();

      if (authenData.status !== 'ok' || !authenData.decoded?.username) {
        handleAuthFailure();
        return;
      }

      const loggedInUsername = authenData.decoded.username;
      await fetchUserProfile(token, loggedInUsername);
    } catch {
      handleAuthFailure();
    }
  }, [fetchUserProfile, handleAuthFailure]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCancel = () => {
    setForm(buildFormFromProfile(profile));
    setEditing(false);
  };

  const handleSave = async () => {
    if (!profile) return;

    const token = localStorage.getItem('token');
    if (!token) {
      handleAuthFailure();
      return;
    }

    const userId = profile.user_id;
    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'บันทึกไม่ได้',
        text: 'ไม่พบ user_id ในข้อมูล users',
        confirmButtonColor: '#7c3aed',
      });
      return;
    }

    setSaving(true);
    const payload = buildSavePayload(profile, form);

    try {
      const res = await fetch(`${API_USERS}/${userId}`, {
        method: 'PUT',
        headers: authHeaders(token, true),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `บันทึกไม่สำเร็จ (${res.status})`);
      }

      const mapped = mapUserFromApi({ ...profile._raw, ...payload });
      setProfile(mapped);
      setForm(buildFormFromProfile(mapped));
      setEditing(false);

      Swal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ',
        text: 'อัปเดตข้อมูลในตาราง users เรียบร้อยแล้ว',
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'บันทึกไม่สำเร็จ',
        text: err.message || 'เกิดข้อผิดพลาด',
        confirmButtonColor: '#7c3aed',
      });
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile?.name || profile?.username || 'ผู้ใช้งาน';
  const username = profile?.username ?? '—';
  const roleName = profile?.role_name || '—';
  const memberSince = formatDate(profile?.created_at);
  const updatedAt = formatDate(profile?.updated_at);
  const avatarUrl = profile?.img ? `http://localhost:5555/${profile.img}` : null;

  const sidebarUser = profile
    ? { username: profile.username, role_name: profile.role_name }
    : null;

  return (
    <div className="h-screen w-full bg-slate-100 flex overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={sidebarUser} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden bg-white/90 backdrop-blur shadow-sm px-4 py-3 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-800">ข้อมูลส่วนตัว</h1>
          <div className="w-10" />
        </header>

        {/* mobile: เลื่อนเนื้อหาใน main ได้ | desktop: ไม่ scroll ทั้งหน้า */}
        <main className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden p-3 lg:p-5">
          <div className="max-w-6xl mx-auto flex flex-col lg:h-full lg:min-h-0">
            <div className="flex-shrink-0 flex items-center justify-end lg:justify-between gap-3 mb-3">
              {/* หัวข้อซ้ำ — แสดงเฉพาะ desktop (mobile ใช้หัวข้อใน header ด้านบน) */}
              <h2 className="hidden lg:block text-xl lg:text-2xl font-bold text-slate-900">ข้อมูลส่วนตัว</h2>
              <div className="flex items-center gap-2">
                {!editing ? (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    disabled={loading || !!error || !profile}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md transition-all disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    แก้ไข
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all disabled:opacity-50"
                    >
                      {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {loading && (
              <div className="flex-1 flex items-center justify-center rounded-2xl bg-white shadow-lg">
                <p className="text-slate-500 font-medium">กำลังตรวจสอบ authen และโหลด users...</p>
              </div>
            )}

            {!loading && error && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 rounded-2xl bg-white shadow-lg p-6">
                <p className="text-red-600 font-medium text-center">{error}</p>
                <button
                  type="button"
                  onClick={loadProfile}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                >
                  ลองโหลดใหม่
                </button>
              </div>
            )}

            {!loading && !error && profile && (
              <div className="lg:flex-1 lg:min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(220px,260px)_1fr] gap-3 lg:gap-4 pb-2 lg:pb-0">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white shadow-xl flex flex-col flex-shrink-0">
                  <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.5),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.4),transparent_45%)]" />
                  <div className="relative flex-1 flex flex-col items-center justify-center p-5 text-center">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="w-20 h-20 lg:w-24 lg:h-24 rounded-full object-cover shadow-lg ring-4 ring-white/20 mb-3"
                      />
                    ) : (
                      <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-3xl lg:text-4xl font-bold uppercase shadow-lg ring-4 ring-white/20 mb-3">
                        {(displayName[0] || username[0] || 'U').toUpperCase()}
                      </div>
                    )}
                    <h3 className="text-lg font-bold leading-tight">{displayName}</h3>
                    <p className="text-sm text-purple-200 mt-0.5">@{username}</p>
                    <span className="mt-3 inline-flex px-3 py-1 rounded-full text-xs font-medium bg-white/15 backdrop-blur border border-white/20">
                      {roleName}
                    </span>
                  </div>
                  <div className="relative border-t border-white/10 px-4 py-3 grid grid-cols-2 gap-2 text-center">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-purple-300">รหัสผู้ใช้</p>
                      <p className="text-sm font-semibold truncate">{profile.user_id || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-purple-300">สมาชิกตั้งแต่</p>
                      <p className="text-sm font-semibold">{memberSince}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white shadow-xl border border-slate-100 flex flex-col flex-shrink-0 lg:min-h-0 lg:overflow-hidden lg:flex-1">
                  <div className="flex-shrink-0 px-4 lg:px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-purple-50/50">
                    <h3 className="font-bold text-slate-800">รายละเอียดบัญชี</h3>
                    <p className="text-xs text-slate-500">
                      {editing ? 'แก้ไขแล้วกดบันทึก' : `อัปเดตล่าสุด: ${updatedAt}`}
                    </p>
                  </div>

                  <div className="p-4 lg:p-5 lg:flex-1 lg:min-h-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                          Username
                        </label>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-sm">
                          <span>@</span>
                          <span className="font-medium">{username}</span>
                          <span className="ml-auto text-[10px] text-slate-400 uppercase">ไม่สามารถแก้ไข</span>
                        </div>
                      </div>

                      {PROFILE_FIELDS.map(({ key, label, placeholder, icon, type }) => (
                        <div key={key}>
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1">
                            <FieldIcon icon={icon} />
                            {label}
                          </label>
                          {editing ? (
                            <input
                              type={type}
                              value={form[key] ?? ''}
                              onChange={(e) => handleChange(key, e.target.value)}
                              placeholder={placeholder}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 transition-shadow"
                            />
                          ) : (
                            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-800 min-h-[38px] flex items-center">
                              {form[key] || <span className="text-slate-400">—</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex-shrink-0 px-4 lg:px-5 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>อัปเดตล่าสุด: {updatedAt}</span>
                    <span className="hidden sm:inline">จับคู่: authen.username = users.username</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <nav className="lg:hidden bg-white border-t border-gray-200 flex justify-around py-2 flex-shrink-0">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                location.pathname === item.path ? 'text-purple-600' : 'text-gray-500'
              }`}
            >
              <span className="text-xl mb-0.5">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
