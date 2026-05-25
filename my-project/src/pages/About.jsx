import Navbar from '../components/Navbar';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-green-600">เกี่ยวกับเรา (About)</h1>
          <p className="mt-4 text-gray-600">ระบบเปลี่ยนหน้าทำงานโดย React Router DOM</p>
        </div>
      </div>
    </div>
  );
}