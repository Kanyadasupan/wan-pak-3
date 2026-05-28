import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import './index.css';
import {
  LayoutDashboard, Users, UserCheck, Settings as SettingsIcon, LogOut,
  Bell, BarChart2, CheckSquare, AlertCircle, X, ConciergeBell, Wrench, Inbox
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import TaskBoard from './pages/TaskBoard';
import GuestList from './pages/GuestList';
import StaffDuty from './pages/StaffDuty';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import AuthPage from './pages/AuthPage';
import DepartmentPage from './pages/DepartmentPage';

// === นำเข้า Firebase Configuration ===
import { auth, db } from './config/firebase'; 
import { doc, getDoc } from 'firebase/firestore';

interface Ticket {
  ticket_id: string;
  room_number: string;
  intent: string;
  items?: string;
  notes?: string;
  status?: string;
  scenario?: string;
  created_at?: string;
  extracted_data?: {
    intent?: string;
    items?: string;
    status?: string;
  };
}

const HeaderTitle = () => {
  const location = useLocation();
  let title = "หน้าหลัก (Dashboard)";
  let subtitle = "จัดการคำขอของแขกแบบเรียลไทม์จากระบบ AI";

  if (location.pathname === '/tasks') {
    title = "ระบบกระดานงาน (Task Board)";
    subtitle = "มุมมองภาพรวมสถานะตั๋วในระบบ";
  } else if (location.pathname === '/guests') {
    title = "รายชื่อแขกที่เข้าพัก (Guest List)";
    subtitle = "ข้อมูลแขกที่เข้าพัก";
  } else if (location.pathname === '/staff') {
    title = "ระบบจัดการบุคลากร (Staff Duty)";
    subtitle = "เช็คอินเข้างานและจัดการข้อมูลพนักงานในกะปัจจุบัน";
  } else if (location.pathname === '/analytics') {
    title = "รายงานและสถิติ (Analytics)";
    subtitle = "ข้อมูลเชิงลึกและประสิทธิภาพการทำงาน";
  } else if (location.pathname === '/settings') {
    title = "ตั้งค่าระบบ (Settings)";
    subtitle = "ปรับแต่งการทำงานของระบบ AI";
  } else if (location.pathname.startsWith('/department/')) {
    const dept = location.pathname.split('/').pop();
    let deptName = 'แผนก';
    if (dept === 'housekeeping') deptName = 'Housekeeping (แม่บ้าน)';
    if (dept === 'maintenance') deptName = 'Maintenance (ซ่อมบำรุง)';
    if (dept === 'room-service') deptName = 'Room Service (รูมเซอร์วิส)';
    if (dept === 'other') deptName = 'Other (อื่นๆ)';
    title = `หน้าข้อมูลแผนก: ${deptName}`;
    subtitle = "ภาพรวมและรายการแจ้งเตือนของแผนก";
  }

  return (
    <div>
      <h2 className="page-title" style={{ margin: 0, fontSize: '1.8rem' }}>{title}</h2>
      <p className="page-subtitle" style={{ margin: 0, fontSize: '0.9rem' }}>{subtitle}</p>
    </div>
  );
};

function AppContent() {
  const location = useLocation();
  const [, setTickets] = useState<Ticket[]>([]);
  const [pendingTickets, setPendingTickets] = useState<Ticket[]>([]);
  const [isOpenNotification, setIsOpenNotification] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  // ข้อมูลโปรไฟล์ผู้ใช้งานจริง
  const [userData, setUserData] = useState<{ firstName: string; lastName: string; role: string } | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // ✨ เพิ่ม State และ Ref สำหรับเมนูโปรไฟล์ออกจากระบบ
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const [seenTicketIds, setSeenTicketIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('seenTicketIds');
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse seenTicketIds from localStorage", e);
      }
    }
    return new Set();
  });

  useEffect(() => {
    localStorage.setItem('seenTicketIds', JSON.stringify(Array.from(seenTicketIds)));
  }, [seenTicketIds]);

  // ดึงข้อมูลโปรไฟล์จาก Firebase Firestore เมื่อมีการเปลี่ยนสถานะการล็อกอิน
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setAuthLoading(true); 
      if (user) {
        try {
          // ค้นหาใน Users (Admin) ก่อน ถ้าไม่เจอค่อยไปหาใน staff (พนักงาน)
          let docSnap = await getDoc(doc(db, "Users", user.uid));
          if (!docSnap.exists()) {
            docSnap = await getDoc(doc(db, "staff", user.uid));
          }

          if (docSnap.exists()) {
            setUserData(docSnap.data() as { firstName: string; lastName: string; role: string });
          } else {
            setUserData({ firstName: 'ไม่พบข้อมูล', lastName: 'ผู้ใช้', role: 'ไม่ระบุตำแหน่ง' });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserData({ firstName: 'เกิดข้อผิดพลาด', lastName: '', role: 'กรุณารีเฟรช' });
        }
      } else {
        setUserData(null);
      }
      setAuthLoading(false); 
    });
    return () => unsubscribe();
  }, []);

  // ฟังก์ชันดึงคิวงานจาก Database ผ่าน API หลังบ้าน
  const fetchTicketsData = useCallback(async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/tickets/');
      if (response.data.status === 'success') {
        const allTickets = response.data.tickets || [];
        setTickets(allTickets);

        const pending = allTickets.filter(
          (t: Ticket) => t.status === 'รอรับเรื่อง' || t.status === 'pending' || !t.status
        );
        setPendingTickets(pending);

        setSelectedTicket((prev) => {
          if (!prev) return null;
          const currentTicket = allTickets.find((t: Ticket) => t.ticket_id === prev.ticket_id);
          return currentTicket || prev;
        });
      }
    } catch (error) {
      console.error("Error fetching tickets data:", error);
    }
  }, []);

  useEffect(() => {
    const initTimer = setTimeout(() => {
      fetchTicketsData();
    }, 0);
    const interval = setInterval(fetchTicketsData, 5000);

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
    };
  }, [fetchTicketsData]);

  // ระบบปิดหน้าต่างอัตโนมัติเมื่อกดข้างนอก (ดักจับทั้งกระดิ่ง และ เมนูโปรไฟล์)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpenNotification(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#091d35' }}>
        <div style={{ color: '#c99f47', fontSize: '1.2rem', fontWeight: 'bold' }}>กำลังตรวจสอบสิทธิ์เข้าใช้งานระบบ AURA...</div>
      </div>
    );
  }

  if (!userData && !isAuthPage) {
    return <Navigate to="/signin" replace />;
  }

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/signin" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
      </Routes>
    );
  }

  const unreadCount = pendingTickets.filter(t => !seenTicketIds.has(t.ticket_id)).length;

  const handleLogout = async () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      await auth.signOut();
    }
  };

  return (
    <div className="dashboard-container">
      {/* === แถบเมนูด้านซ้าย (Sidebar Navigation) === */}
      <aside className="sidebar">
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0 20px 0' }}>
          <div className="sidebar-logo-icon" style={{ 
            background: 'linear-gradient(135deg, #163052 0%, #091d35 100%)', 
            color: '#c99f47', borderRadius: '50%', width: '48px', height: '48px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 2px rgba(201, 159, 71, 0.3), 0 4px 12px rgba(0, 0, 0, 0.3)',
            border: '1px solid #c99f47'
          }}>
            <ConciergeBell size={24} />
          </div>
          <div>
            <h1 style={{ 
              color: '#ffffff', margin: 0, fontSize: '1.8rem', 
              fontFamily: "'Playfair Display', serif", fontWeight: 800, 
              letterSpacing: '1px', textShadow: '0px 2px 4px rgba(0,0,0,0.5)'
            }}>AURA</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <div style={{ height: '1px', width: '12px', backgroundColor: '#c99f47', opacity: 0.5 }}></div>
              <p style={{ color: '#c99f47', fontSize: '0.65rem', margin: 0, letterSpacing: '2px', fontWeight: 600, textTransform: 'uppercase' }}>HOTEL</p>
              <div style={{ height: '1px', width: '12px', backgroundColor: '#c99f47', opacity: 0.5 }}></div>
            </div>
          </div>
        </div>

          <nav className="sidebar-nav">
            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>

            <div style={{ padding: '24px 20px 8px', fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>
              งานด้านโรงแรม
            </div>
            <NavLink to="/department/housekeeping" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Inbox size={20} />
              <span>Housekeeping</span>
            </NavLink>
            <NavLink to="/department/maintenance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Wrench size={20} />
              <span>Maintenance</span>
            </NavLink>
            <NavLink to="/department/room-service" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <ConciergeBell size={20} />
              <span>Room Service</span>
            </NavLink>
            <NavLink to="/department/other" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <AlertCircle size={20} />
              <span>Other / อื่นๆ</span>
            </NavLink>

            <div style={{ padding: '24px 20px 8px', fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>
              การจัดการระบบ
            </div>
            <NavLink to="/tasks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <CheckSquare size={20} />
              <span>Task Board (ภาพรวม)</span>
            </NavLink>
            <NavLink to="/guests" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Users size={20} />
              <span>รายชื่อแขกที่เข้าพัก</span>
            </NavLink>
            <NavLink to="/staff" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <UserCheck size={20} />
              <span>Staff Management</span>
            </NavLink>
            <NavLink to="/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <BarChart2 size={20} />
              <span>Reports & Analytics</span>
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <SettingsIcon size={20} />
              <span>Settings</span>
            </NavLink>
          </nav>

          <div style={{ marginTop: 'auto' }}>
            <button onClick={handleLogout} className="nav-item" style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'none', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8' }}>
              <LogOut size={20} />
              <span>ออกจากระบบ</span>
            </button>
          </div>
      </aside>

        {/* === พื้นที่เนื้อหาหลัก === */}
        <main className="main-content">
          <header className="page-header" style={{ margin: '-40px -40px 24px -40px', padding: '16px 40px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
            <HeaderTitle />
            <div className="user-profile" style={{ display: 'flex', alignItems: 'center' }}>

              {/* ปุ่มกระดิ่งแจ้งเตือน */}
              <div className="notification-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsOpenNotification(!isOpenNotification)}
                  className="btn btn-secondary"
                  style={{ padding: '8px', borderRadius: '50%', position: 'relative', overflow: 'visible', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: '-4px', right: '-4px',
                      backgroundColor: '#EF4444', color: 'white', borderRadius: '50%',
                      width: '18px', height: '18px', fontSize: '11px', fontWeight: 'bold',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid white'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isOpenNotification && (
                  <div className="notification-dropdown" style={{
                    position: 'absolute', top: '45px', right: 0,
                    width: '340px', backgroundColor: '#1e293b', border: '1px solid #475569',
                    borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
                    zIndex: 9999, overflow: 'hidden'
                  }}>
                    <div style={{ padding: '14px', borderBottom: '1px solid #475569', fontWeight: 'bold', fontSize: '14px', display: 'flex', justifyContent: 'space-between', backgroundColor: '#0f172a' }}>
                      <span style={{ color: '#e2e8f0' }}>งานเข้ามาใหม่ด่วน</span>
                      <span className="animate-pulse" style={{ color: '#f43f5e', fontSize: '12px', backgroundColor: '#881337', padding: '2px 8px', borderRadius: '12px' }}>
                        ค้าง {unreadCount} สาย
                      </span>
                    </div>

                    <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                      {pendingTickets.filter(t => !seenTicketIds.has(t.ticket_id)).length === 0 ? (
                        <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                          ไม่มีสายแจ้งเรื่องใหม่
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {pendingTickets.filter(t => !seenTicketIds.has(t.ticket_id)).map((t) => (
                            <div
                              key={t.ticket_id}
                              onClick={() => {
                                setSelectedTicket(t);
                                setIsOpenNotification(false);
                                setSeenTicketIds(prev => new Set(prev).add(t.ticket_id));
                              }}
                              style={{
                                padding: '14px', borderBottom: '1px solid #334155', fontSize: '13px',
                                display: 'flex', gap: '12px', alignItems: 'flex-start', backgroundColor: '#1e293b',
                                cursor: 'pointer', transition: 'background-color 0.2s'
                              }}
                              className="hover-notification-item"
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#273549')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1e293b')}
                            >
                              <AlertCircle size={18} color="#f59e0b" style={{ marginTop: '2px', flexShrink: 0 }} />
                              <div style={{ width: '100%' }}>
                                <div style={{ fontWeight: 'bold', color: '#f8fafc', display: 'flex', justifyContent: 'space-between' }}>
                                  <span>ห้อง {t.room_number}</span>
                                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>
                                    {t.created_at ? new Date(t.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.' : 'เมื่อสักครู่'}
                                  </span>
                                </div>
                                <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '3px' }}>
                                  เรื่อง: <span style={{ color: '#38bdf8', fontWeight: 'medium' }}>{t.extracted_data?.intent || t.intent || 'ทั่วไป'}</span> {(t.extracted_data?.items || t.items) && `[${t.extracted_data?.items || t.items}]`}
                                </div>
                                <div style={{ color: '#64748b', fontSize: '11px', marginTop: '4px', fontStyle: 'italic' }}>
                                  คลิกเพื่อดูรายละเอียดและรับงาน...
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ borderLeft: '1px solid var(--border-color)', height: '40px', margin: '0 8px' }}></div>
              
              {/* 🛠️ ✨ ปรับเปลี่ยนโครงสร้างบล็อกโปรไฟล์ตรงนี้ ให้สามารถคลิกเพื่อกางหน้าต่างย่อยออกมาได้แล้วครับ */}
              <div 
                ref={profileMenuRef}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', position: 'relative', padding: '4px 8px', borderRadius: '8px' }}
                className="profile-clickable-wrapper"
              >
                <div className="user-info" style={{ textAlign: 'right', userSelect: 'none' }}>
                  <div className="user-name">
                    {userData ? `คุณ${userData.firstName} ${userData.lastName}` : 'กำลังโหลด...'}
                  </div>
                  <div className="user-role">
                    {userData ? userData.role : 'พนักงาน'}
                  </div>
                </div>
                <div className="avatar" style={{ userSelect: 'none' }}>
                  {userData && userData.firstName ? userData.firstName[0] : 'ส'}
                </div>

                {/* แผงเมนูย่อยป๊อปอัปที่จะเด้งลงมาเมื่อทำการคลิกเมาส์ */}
                {showProfileMenu && (
                  <div style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: '12px',
                    width: '180px', backgroundColor: '#1e293b', border: '1px solid #475569',
                    borderRadius: '10px', boxShadow: '0 15px 30px rgba(0,0,0,0.4)',
                    overflow: 'hidden', zIndex: 99999
                  }}>
                    <div style={{ padding: '10px 14px', fontSize: '11px', color: '#94a3b8', borderBottom: '1px solid #334155', backgroundColor: '#0f172a' }}>
                      บัญชีผู้ใช้งานระบบ
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // ป้องกันบั๊กการคลิกซ้อน
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      style={{
                        width: '100%', background: 'transparent', border: 'none',
                        padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px',
                        color: '#f87171', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
                        textAlign: 'left', fontFamily: 'inherit', transition: 'background-color 0.15s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2d3748')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <LogOut size={16} />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </header>

          {/* หน้าต่างป๊อปอัปตั๋วงาน */}
          {selectedTicket && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              zIndex: 10000, padding: '20px'
            }}>
              <div style={{
                width: '100%', maxWidth: '460px', backgroundColor: '#ffffff',
                borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                color: '#1e293b', border: '1px solid #e2e8f0', position: 'relative'
              }}>
                <button
                  onClick={() => setSelectedTicket(null)}
                  style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <X size={20} color="#94a3b8" />
                </button>

                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{
                      backgroundColor: '#FEF3C7', color: '#D97706', padding: '6px 14px',
                      borderRadius: '30px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                      <span style={{ width: '6px', height: '6px', backgroundColor: '#D97706', borderRadius: '50%' }}></span>
                      {selectedTicket.status || 'pending'}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '13px', marginRight: '32px' }}>
                      เวลา {selectedTicket.created_at ? new Date(selectedTicket.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-'} น.
                    </span>
                  </div>

                  <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 20px 0', color: '#0f172a' }}>
                    ห้อง {selectedTicket.room_number}
                  </h2>

                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid #f1f5f9' }}>
                    <div style={{ marginBottom: '12px', fontSize: '14px' }}>
                      <span style={{ color: '#64748b' }}>Intent:</span> &nbsp;
                      <span style={{ fontWeight: '600', color: '#e11d48' }}>{selectedTicket.extracted_data?.intent || selectedTicket.intent || '-'}</span>
                    </div>
                    <div style={{ marginBottom: '12px', fontSize: '14px' }}>
                      <span style={{ color: '#64748b' }}>Items:</span> &nbsp;
                      <span style={{ fontWeight: '600', color: '#334155' }}>{selectedTicket.extracted_data?.items || selectedTicket.items || '-'}</span>
                    </div>
                    <div style={{ fontSize: '14px' }}>
                      <span style={{ color: '#64748b' }}>Status:</span> &nbsp;
                      <span style={{ fontWeight: '600', color: '#334155' }}>{selectedTicket.status || 'pending'}</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '6px', textTransform: 'uppercase' }}>Voice Record</div>
                    <div style={{ backgroundColor: '#f1f5f9', borderRadius: '30px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <audio controls style={{ width: '100%', height: '32px' }}>
                        <source src="#" type="audio/mpeg" />
                        เบราว์เซอร์ของคุณไม่รองรับการเล่นเสียง
                      </audio>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<TaskBoard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/guests" element={<GuestList />} />
            <Route path="/staff" element={<StaffDuty />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/department/:deptName" element={<DepartmentPage />} />
          </Routes>
        </main>
      </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;