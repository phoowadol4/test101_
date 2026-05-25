import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function AuthLayout() {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        setIsChecking(false);
        return;
      }

      try {               
        
        const response_users = await fetch("http://localhost:5555/users/", {
          method:"GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        const response_authen = await fetch("http://localhost:5555/authen/", {
          method:"POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
 
        const data_authen = await response_authen.json();
        console.log("data_authen",data_authen);
        
        if (data_authen.status === 'ok') {
          // ลองเช็คว่าข้อมูล user อยู่ใน key ไหน (ปกติมักจะเป็น .decoded, .user หรือ .data)
          const userDataFromApi = data_authen.decoded || data_authen.user || data_authen.data || data_authen;
          setUserData(userDataFromApi);
          setIsAuthenticated(true);
        } else {
          throw new Error('Token invalid');
        }
        
      } catch (error) {
        console.error("Auth error:", error);
        localStorage.removeItem('token');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">กำลังตรวจสอบข้อมูลผู้ใช้...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ส่ง userData ผ่าน context ไปให้ทุกหน้าที่อยู่ภายใต้ AuthLayout ใช้งานได้
  return <Outlet context={{ user: userData }} />;
}
