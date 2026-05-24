import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <Router>
      {/* 💡 คลุมโครงสร้างทั้งหมดด้วย h-[100dvh] และ flex-col และห้ามให้ขอบเขตล้นจอด้วย overflow-hidden */}
      <div className="h-[100dvh] w-full flex flex-col bg-gray-50 overflow-hidden">
        
        {/* ส่วนที่ 1: แถบเมนูด้านบน (ความสูงคงที่ตามคอนเทนต์) */}
        <nav className="bg-slate-900 text-white p-4 shadow-lg flex justify-center gap-8 flex-shrink-0">
          <Link to="/" className="text-slate-200 hover:text-blue-400 font-medium transition-colors">หน้าแรก</Link>
          <Link to="/about" className="text-slate-200 hover:text-blue-400 font-medium transition-colors">เกี่ยวกับเรา</Link>
          <Link to="/login" className="text-slate-200 hover:text-blue-400 font-medium transition-colors">เข้าสู่ระบบ</Link>
        </nav>

        {/* ส่วนที่ 2: พื้นที่แสดงเนื้อหาที่เหลือ (ใช้ flex-1 เพื่อดูดพื้นที่ที่เหลือทั้งหมด และจัดให้อยู่กึ่งกลางเป๊ะ) */}
        <main className="flex-1 flex items-center justify-center p-4 min-h-0">
          <Routes>
            <Route path="/" element={<div className="text-center text-2xl font-bold">หน้าแรก</div>} />
            <Route path="/about" element={<div className="text-center text-2xl font-bold">เกี่ยวกับเรา</div>} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}