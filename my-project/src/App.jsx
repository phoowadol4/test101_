import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AuthLayout from './layouts/AuthLayout';
import History from './pages/History';
import Profile from './pages/Profile';
import HomeVisit from './pages/HomeVisit';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        {/* กลุ่มหน้าที่ต้องการการ Login (Protected Routes) */}
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/home-visit" element={<HomeVisit />} />

          {/* สามารถเพิ่มหน้าอื่นๆ ที่ต้องการการ login ไว้ในนี้ได้เลย */}
          {/* <Route path="/stats" element={<Stats />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}