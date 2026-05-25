import { useState } from 'react';
import { Link, useLocation, useOutletContext } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useOutletContext() ?? {};

  const menuItems = [
    { icon: '🏠', label: 'หน้าแรก', path: '/' },
    { icon: '📊', label: 'ประวัติการการใช้งาน', path: '/history' },
    { icon: '👤', label: 'ข้อมูลส่วนตัว', path: '/profile' },
    { icon: '⚙️', label: 'ตั้งค่า', path: '/settings' },
    { icon: '📋', label: 'รายงาน', path: '/reports' },
    { icon: '🔔', label: 'แจ้งเตือน', path: '/notifications' },
  ];

  return (
    <div className="h-screen w-full bg-gray-100 flex overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
          <div className="w-10" />
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">ยินดีต้อนรับ! 👋</h2>
              <p className="text-gray-600">นี่คือ Dashboard ของคุณ จัดการทุกอย่างได้ที่นี่</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'ผู้ใช้งานทั้งหมด', value: '1,234', icon: '👥', color: 'from-blue-500 to-blue-600' },
                { label: 'รายได้', value: '฿45,678', icon: '💰', color: 'from-green-500 to-green-600' },
                { label: 'คำสั่งซื้อ', value: '567', icon: '📦', color: 'from-purple-500 to-purple-600' },
                { label: 'การเข้าชม', value: '8,901', icon: '👁️', color: 'from-pink-500 to-pink-600' },
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center text-2xl`}>
                      {stat.icon}
                    </div>
                    <span className="text-green-500 text-sm font-medium">+12.5%</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">กราฟยอดขาย</h3>
                <div className="h-64 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <p className="text-gray-500">กราฟยอดขาย (ตัวอย่าง)</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">กราฟผู้ใช้งาน</h3>
                <div className="h-64 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                  <p className="text-gray-500">กราฟผู้ใช้งาน (ตัวอย่าง)</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">กิจกรรมล่าสุด</h3>
              <div className="space-y-4">
                {[
                  { user: 'สมชาย ใจดี', action: 'สมัครสมาชิกใหม่', time: '5 นาทีที่แล้ว', icon: '👤' },
                  { user: 'วิภา สุขใจ', action: 'ทำการสั่งซื้อ #1234', time: '15 นาทีที่แล้ว', icon: '🛒' },
                  { user: 'นภา รักษ์ดี', action: 'อัปเดตโปรไฟล์', time: '30 นาทีที่แล้ว', icon: '✏️' },
                  { user: 'กิตติ เก่งมาก', action: 'ติดต่อสอบถาม', time: '1 ชั่วโมงที่แล้ว', icon: '💬' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xl">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.user}</p>
                      <p className="text-sm text-gray-500">{activity.action}</p>
                    </div>
                    <span className="text-sm text-gray-400">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden bg-white border-t border-gray-200 flex justify-around py-2 flex-shrink-0">
          {menuItems.slice(0, 4).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'text-purple-600'
                  : 'text-gray-500'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
