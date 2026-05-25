import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-slate-900 text-white p-4 shadow-lg flex justify-center gap-8 flex-shrink-0">
      <Link to="/Home" className="text-slate-200 hover:text-blue-400 font-medium transition-colors">หน้าแรก</Link>
      <Link to="/about" className="text-slate-200 hover:text-blue-400 font-medium transition-colors">เกี่ยวกับเรา</Link>
      <Link to="/login" className="text-slate-200 hover:text-blue-400 font-medium transition-colors">เข้าสู่ระบบ</Link>
      {/* <Link to="/dashboard" className="text-slate-200 hover:text-blue-400 font-medium transition-colors">แดชบอร์ด</Link> */}
    </nav>
  );
}
