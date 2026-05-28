import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase'; 
import { Bell, LogOut, ChevronDown, User, Shield } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          console.log("พนักงานที่กำลังล็อกอิน UID คือ:", user.uid); // ปริ้นต์ดูใน Console เบราว์เซอร์ได้ด้วย
          
          const docRef = doc(db, "Users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            // 🚨 แก้ไขจุดนี้: บังคับให้แสดง UID ปัจจุบันที่หน้าจอเพื่อเอาไปเช็กใน Firebase
            setUserData({ 
              firstName: "ไม่พบข้อมูล UID:", 
              lastName: user.uid, 
              role: "ไม่มีเอกสารนี้ในคอลเลกชัน Users" 
            });
          }
        } catch (error) {
          console.error("เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน:", error);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const confirmLogout = window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?");
    if (confirmLogout) {
      try {
        await signOut(auth);
        navigate('/signin');
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการออกจากระบบ:", error);
      }
    }
  };

  const getPageDetails = () => {
    switch (location.pathname) {
      case '/':
        return { title: 'หน้าหลัก (Dashboard)', subtitle: 'จัดการคำขอของแขกแบบเรียลไทม์จากระบบ AI' };
      case '/housekeeping':
        return { title: 'หน้าข้อมูลแผนก: Housekeeping', subtitle: 'ภาพรวมและการแจ้งเตือนงานทำความสะอาดห้องพัก' };
      case '/maintenance':
        return { title: 'หน้าข้อมูลแผนก: Maintenance', subtitle: 'การจัดการงานแจ้งซ่อมและบำรุงรักษาอุปกรณ์' };
      case '/room-service':
        return { title: 'หน้าข้อมูลแผนก: Room Service (รูมเซอร์วิส)', subtitle: 'ภาพรวมและรายการแจ้งเตือนของแผนก' };
      case '/staff':
      case '/staff-management':
        return { title: 'การจัดการพนักงาน (Staff Management)', subtitle: 'ตรวจสอบรายชื่อและสถานะการเข้างาน' };
      default:
        return { title: 'ระบบจัดการโรงแรม AURA', subtitle: 'Aura Hotel Backend Management System' };
    }
  };

  const pageDetails = getPageDetails();

  return (
    <header className="main-navbar">
      {styleTag}

      <div className="navbar-left">
        <h1>{pageDetails.title}</h1>
        <p>{pageDetails.subtitle}</p>
      </div>

      <div className="navbar-right">
        <button className="icon-btn-bell" title="การแจ้งเตือน">
          <Bell size={20} />
          <span className="bell-badge"></span>
        </button>

        <div className="nav-divider"></div>

        <div className="user-profile-wrapper">
          <div className="user-profile-card" onClick={() => setShowDropdown(!showDropdown)}>
            <div className="user-text-info">
              {/* จุดที่แสดงชื่อและ UID */}
              <span className="user-name" style={{ fontSize: userData?.firstName?.includes('ไม่พบ') ? '11px' : '0.95rem', color: '#ef4444' }}>
                {loading ? "กำลังโหลด..." : `${userData?.firstName || ''} ${userData?.lastName || ''}`}
              </span>
              <span className="user-role">
                {loading ? "พนักงาน" : userData?.role || "พนักงาน"}
              </span>
            </div>
            
            <div className="user-avatar-circle">
              {userData?.firstName && !userData.firstName.includes('ไม่พบ') ? userData.firstName.charAt(0) : "!"}
            </div>
            
            <ChevronDown size={16} className={`chevron-icon ${showDropdown ? 'rotate' : ''}`} />
          </div>

          {showDropdown && (
            <div className="profile-dropdown-menu">
              <div className="dropdown-header">
                <p className="full-name" style={{ fontSize: '11px' }}>{userData?.firstName} {userData?.lastName}</p>
                <p className="role-tag"><Shield size={12} /> {userData?.role || 'พนักงาน'}</p>
              </div>
              <div className="dropdown-divider"></div>
              <button onClick={handleLogout} className="dropdown-item-logout">
                <LogOut size={16} />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const styleTag = (
  <style>{`
    .main-navbar { display: flex; justify-content: space-between; align-items: center; background-color: #ffffff; padding: 18px 40px; border-bottom: 1px solid #e2e8f0; width: 100%; box-sizing: border-box; font-family: 'Kanit', sans-serif; }
    .navbar-left h1 { font-size: 1.75rem; color: #091d35; margin: 0 0 4px 0; font-weight: 700; }
    .navbar-left p { color: #64748b; font-size: 0.9rem; margin: 0; }
    .navbar-right { display: flex; align-items: center; gap: 20px; }
    .icon-btn-bell { background: #f1f5f9; border: none; color: #091d35; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; transition: all 0.2s ease; }
    .icon-btn-bell:hover { background: #e2e8f0; transform: scale(1.03); }
    .bell-badge { position: absolute; top: 11px; right: 12px; width: 8px; height: 8px; background-color: #ef4444; border-radius: 50%; border: 1.5px solid #ffffff; }
    .nav-divider { width: 1px; height: 32px; background-color: #e2e8f0; }
    .user-profile-wrapper { position: relative; }
    .user-profile-card { display: flex; align-items: center; gap: 14px; cursor: pointer; padding: 6px 12px; border-radius: 12px; transition: all 0.2s ease; user-select: none; }
    .user-profile-card:hover { background-color: #f8fafc; }
    .user-text-info { display: flex; flex-direction: column; text-align: right; }
    .user-name { font-size: 0.95rem; font-weight: 600; color: #091d35; }
    .user-role { font-size: 0.8rem; color: #64748b; margin-top: 1px; }
    .user-avatar-circle { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #163052 0%, #091d35 100%); color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 1.1rem; border: 1px solid rgba(201, 159, 71, 0.3); }
    .chevron-icon { color: #64748b; transition: transform 0.2s ease; }
    .chevron-icon.rotate { transform: rotate(180deg); }
    .profile-dropdown-menu { position: absolute; top: 55px; right: 0; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); width: 280px; z-index: 999; padding: 6px; animation: slideDown 0.15s ease-out; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
    .dropdown-header { padding: 10px 14px; }
    .dropdown-header .full-name { font-size: 0.9rem; font-weight: 600; color: #091d35; margin: 0 0 4px 0; word-break: break-all; }
    .dropdown-header .role-tag { font-size: 0.75rem; color: #ef4444; margin: 0; display: flex; align-items: center; gap: 4px; font-weight: 500; }
    .dropdown-divider { height: 1px; background-color: #f1f5f9; margin: 4px 0; }
    .dropdown-item-logout { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 14px; background: transparent; border: none; color: #ef4444; font-size: 0.9rem; font-weight: 500; cursor: pointer; border-radius: 8px; text-align: left; transition: background 0.2s ease; font-family: 'Kanit', sans-serif; }
    .dropdown-item-logout:hover { background-color: #fef2f2; }
  `}</style>
);

export default Navbar;