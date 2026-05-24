import { useState } from 'react';
import Swal from 'sweetalert2';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // เพิ่มสถานะการโหลดเพื่อป้องกันการกดเบิ้ล

  const handleLogin = async (e) => {
    e.preventDefault();

    // 1. ตรวจสอบก่อนว่ากรอกข้อมูลครบถ้วนไหม
    if (!username || !password) {
      Swal.fire({
        icon: 'error',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอก Username และ Password ให้ครบถ้วน!',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    setIsLoading(true);

    try {
      // 2. ส่งข้อมูลไปที่ API หลังบ้าน
      const response = await fetch("http://localhost:5555/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      const data = await response.json();
      console.log("Response data:", data);

      // 3. ตรวจสอบผลลัพธ์จาก API
      if (data.status === "ok") {
        localStorage.setItem("token", data.token);
        
        await Swal.fire({
          icon: 'success',
          title: 'เข้าสู่ระบบสำเร็จ!',
          text: `ยินดีต้อนรับคุณ ${username}`,
          confirmButtonColor: '#22c55e',
          timer: 2000,
          showConfirmButton: false
        });

        window.location.href = "/dashboard"; // พาไปหน้า Dashboard
      } else {
        // หากรหัสไม่ถูกต้องหรือมีข้อผิดพลาดจากหลังบ้าน
        Swal.fire({
          icon: "error",
          title: "เข้าสู่ระบบไม่สำเร็จ",
          text: data.message || "Username หรือ Password ไม่ถูกต้อง!",
          confirmButtonColor: '#ef4444',
        });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-4 sm:space-y-6">
      
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">เข้าสู่ระบบ</h1>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
          กรุณากรอกข้อมูลของคุณเพื่อดำเนินการต่อ
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base disabled:bg-gray-100"
            placeholder="กรอกชื่อผู้ใช้งาน"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base disabled:bg-gray-100"
            placeholder="กรอกรหัสผ่าน"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent rounded-lg shadow-md text-sm sm:text-base font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:bg-green-400"
          >
            {isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
          </button>
        </div>
      </form>

    </div>
  );
}