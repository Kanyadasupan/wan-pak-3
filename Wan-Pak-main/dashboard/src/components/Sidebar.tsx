import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { LayoutDashboard, BedDouble, Wrench, Utensils, ClipboardList, Users, LogOut } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
    } catch (error) {
      console.error("ออกจากระบบล้มเหลว:", error);
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Housekeeping', path: '/housekeeping', icon: <BedDouble size={20} /> },
    { name: 'Maintenance', path: '/maintenance', icon: <Wrench size={20} /> },
    { name: 'Room Service', path: '/room-service', icon: <Utensils size={20} /> },
    { name: 'Task Board', path: '/tasks', icon: <ClipboardList size={20} /> },
    { name: 'Staff', path: '/staff', icon: <Users size={20} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="logo">AURA HOTEL</div>
      <nav className="menu">
        {menuItems.map((item) => (
          <button 
            key={item.name} 
            className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.icon} {item.name}
          </button>
        ))}
      </nav>
      
      {/* ปุ่ม Logout อยู่ล่างสุด */}
      <button className="logout-btn" onClick={handleLogout}>
        <LogOut size={20} /> ออกจากระบบ
      </button>

      <style>{`
        .sidebar { width: 260px; height: 100vh; background: #091d35; color: white; display: flex; flex-direction: column; padding: 20px; }
        .logo { font-size: 1.5rem; font-weight: bold; margin-bottom: 40px; color: #c99f47; }
        .menu { flex: 1; display: flex; flex-direction: column; gap: 10px; }
        .menu-item { background: transparent; border: none; color: white; padding: 12px; display: flex; align-items: center; gap: 10px; cursor: pointer; border-radius: 8px; transition: 0.3s; }
        .menu-item:hover, .menu-item.active { background: #163052; color: #c99f47; }
        .logout-btn { background: #163052; border: none; color: #ff6b6b; padding: 12px; display: flex; align-items: center; gap: 10px; cursor: pointer; border-radius: 8px; }
        .logout-btn:hover { background: #2a0f0f; }
      `}</style>
    </aside>
  );
};

export default Sidebar;