import { Link, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function Sidebar({ sidebarOpen, setSidebarOpen, user }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: 'ออกจากระบบ?',
      text: "คุณต้องการออกจากระบบใช่หรือไม่?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'ออกจากระบบ',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        navigate('/Home');
      }
    });
  };

  const menuItems = [
    { icon: '🏠', label: 'หน้าแรก', path: '/' },
    { icon: '📊', label: 'ประวัติการใช้งาน', path: '/history' },
    { icon: '🏡', label: 'เยี่ยมบ้านนักเรียน', path: '/home-visit' },
    { icon: '📈', label: 'สถิติ', path: '/stats' },
    { icon: '👤', label: 'ข้อมูลส่วนตัว', path: '/profile' },
    { icon: '⚙️', label: 'ตั้งค่า', path: '/settings' },
    { icon: '📋', label: 'รายงาน', path: '/reports' },  
    { icon: '🔔', label: 'แจ้งเตือน', path: '/notifications' },
  ];

  return (
    <>
      {/* Sidebar - PC Only */}
      <aside className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex-shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">✨</span>
            Dashboard
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-700">
          <Link
            to="/profile"
            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
              location.pathname === '/profile'
                ? 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 ring-1 ring-purple-400/50'
                : 'bg-slate-700/50 hover:bg-slate-700'
            }`}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold uppercase">
              {user?.username?.[0] || 'U'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{user?.username || 'U'}</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              className="text-slate-400 hover:text-red-400 transition-colors"
              title="ออกจากระบบ"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </Link>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white transform transition-transform duration-300 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">✨</span>
            Dashboard
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <Link
            to="/profile"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
              location.pathname === '/profile'
                ? 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 ring-1 ring-purple-400/50'
                : 'bg-slate-700/50 hover:bg-slate-700'
            }`}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold uppercase">
              {user?.username?.[0] || 'U'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{user?.username || 'ผู้ใช้'}</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              className="text-slate-400 hover:text-red-400 transition-colors"
              title="ออกจากระบบ"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </Link>
        </div>
      </aside>
    </>
  );
}
