import { NavLink } from 'react-router-dom';
import { ConciergeBell } from 'lucide-react';
import '../index.css';

const SignIn = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      
      {/* Left Side - Image Background */}
      <div style={{ 
        flex: 1.2, 
        position: 'relative'
      }} className="auth-image-side">
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'linear-gradient(135deg, rgba(9, 29, 53, 0.85) 0%, rgba(9, 29, 53, 0.4) 100%), url("/bg-hotel.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px'
        }}>
          <h1 style={{ color: 'white', fontSize: '3rem', fontFamily: "'Playfair Display', serif", fontWeight: 700, margin: '0 0 16px 0', lineHeight: 1.2 }}>
            Welcome to<br/>Modern Excellence
          </h1>
          <p style={{ color: '#e2e8f0', fontSize: '1.1rem', maxWidth: '400px', lineHeight: 1.6 }}>
            Experience the next generation of hospitality management. Streamline your operations with our AI-powered concierge system.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px 24px', backgroundColor: '#f8fafc' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #163052 0%, #091d35 100%)', 
              color: '#c99f47', borderRadius: '50%', width: '64px', height: '64px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 2px rgba(201, 159, 71, 0.3), 0 4px 12px rgba(0, 0, 0, 0.3)',
              border: '1px solid #c99f47', margin: '0 auto 16px auto'
            }}>
              <ConciergeBell size={32} />
            </div>
            <h1 style={{ margin: 0, fontSize: '2.2rem', fontFamily: "'Playfair Display', serif", fontWeight: 700, letterSpacing: '2px', color: '#091d35' }}>
              AURA
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', justifyContent: 'center' }}>
              <div style={{ height: '1px', width: '20px', backgroundColor: '#c99f47', opacity: 0.5 }}></div>
              <p style={{ color: '#c99f47', fontSize: '0.7rem', margin: 0, letterSpacing: '2px', fontWeight: 600, textTransform: 'uppercase' }}>HOTEL</p>
              <div style={{ height: '1px', width: '20px', backgroundColor: '#c99f47', opacity: 0.5 }}></div>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '16px' }}>เข้าสู่ระบบจัดการโรงแรม</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); window.location.href = '/'; }}>
            <div className="input-group" style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>อีเมล (Email)</label>
              <input type="email" placeholder="admin@hotel.com" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '8px', outline: 'none', fontSize: '15px', backgroundColor: 'white' }} />
            </div>
            <div className="input-group" style={{ marginBottom: '32px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#334155', display: 'flex', justifyContent: 'space-between' }}>
                รหัสผ่าน (Password)
                <a href="#" style={{ color: '#c99f47', textDecoration: 'none', fontWeight: 600 }}>ลืมรหัสผ่าน?</a>
              </label>
              <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '8px', outline: 'none', fontSize: '15px', backgroundColor: 'white' }} />
            </div>

            <button type="submit" style={{ 
              width: '100%', background: '#091d35', color: 'white', padding: '16px', 
              borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(9, 29, 53, 0.15)', transition: 'all 0.2s'
            }}>
              เข้าสู่ระบบ
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', color: '#64748b' }}>
            ยังไม่มีบัญชีผู้ใช้? <NavLink to="/signup" style={{ color: '#091d35', fontWeight: 700, textDecoration: 'none' }}>สมัครสมาชิก</NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
