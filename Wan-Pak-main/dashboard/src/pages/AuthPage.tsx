import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../config/firebase'; // นำเข้า auth และ db จาก config ของคุณ
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; 
import { ConciergeBell, Mail, Lock, User, Loader2 } from 'lucide-react';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // เช็กว่าอยู่ในโหมด สมัครสมาชิก หรือไม่จากพาร์ท URL
  const isSignUp = location.pathname === '/signup';

  // State สำหรับเก็บข้อมูลฟอร์ม
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // State สำหรับควบคุม UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ฟังก์ชันสลับหน้าไปมาระหว่าง Sign In และ Sign Up
  const toggleAuth = () => {
    setError('');
    navigate(isSignUp ? '/signin' : '/signup');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // 1. ขั้นตอนการสมัครสมาชิกพนักงานใหม่
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // บันทึกลงตาราง Users และให้สิทธิ์เป็น admin สำหรับคนที่สมัครผ่านหน้านี้
        await setDoc(doc(db, "Users", userCredential.user.uid), {
          firstName,
          lastName,
          role: "admin", 
          createdAt: new Date()
        });
        
        alert('ลงทะเบียนพนักงานใหม่สำเร็จ!');
      } else {
        // 2. ขั้นตอนการเข้าสู่ระบบ
        await signInWithEmailAndPassword(auth, email, password);
      }
      
      // เมื่อสำเร็จ ให้เด้งกลับไปหน้าหลัก (Dashboard)
      navigate('/'); 
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error(error);
      // แปลงข้อความ Error ให้เป็นภาษาไทยเข้าใจง่าย
      if (error.code === 'auth/email-already-in-use') {
        setError('อีเมลนี้ถูกใช้งานในระบบแล้ว');
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
      } else if (error.code === 'auth/weak-password') {
        setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      } else {
        setError('เกิดข้อผิดพลาด: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* ฝัง Scoped CSS สไตล์โรงแรมหรูหราพรีเมียม */}
      <style>{`
        .auth-wrapper {
          display: flex;
          min-height: 100vh;
          width: 100vw;
          font-family: 'Kanit', 'Inter', sans-serif;
          background-color: #091d35;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          overflow-x: hidden;
        }
        
        /* แบนเนอร์ภาพฝั่งซ้าย */
        .auth-banner {
          flex: 1.2;
          position: relative;
          background: linear-gradient(135deg, rgba(9, 29, 53, 0.92) 0%, rgba(22, 48, 82, 0.65) 100%), 
                      url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1470&auto=format&fit=crop');
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px;
        }
        
        @media (max-width: 968px) {
          .auth-banner { display: none; }
        }
        
        .banner-text {
          max-width: 500px;
          color: #ffffff;
        }
        
        .banner-text h1 {
          font-size: 2.8rem;
          font-weight: 700;
          margin-bottom: 20px;
          line-height: 1.3;
          color: #ffffff;
          font-family: 'Playfair Display', 'Kanit', serif;
        }
        
        .banner-text p {
          font-size: 1.1rem;
          color: #cbd5e1;
          line-height: 1.7;
          font-weight: 300;
        }

        /* ฟอร์มกรอกข้อมูลฝั่งขวา */
        .auth-form-container {
          flex: 1;
          background-color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          box-shadow: -10px 0 30px rgba(0,0,0,0.15);
          z-index: 10;
        }
        
        .form-box {
          width: 100%;
          max-width: 400px;
        }
        
        .logo-area {
          text-align: center;
          margin-bottom: 35px;
        }
        
        .logo-icon {
          background: linear-gradient(135deg, #163052 0%, #091d35 100%);
          color: #c99f47;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px auto;
          box-shadow: 0 8px 16px rgba(9, 29, 53, 0.2);
          border: 1px solid rgba(201, 159, 71, 0.4);
        }
        
        .logo-area h2 {
          font-size: 2.2rem;
          color: #091d35;
          margin: 0 0 4px 0;
          font-family: 'Playfair Display', 'Kanit', serif;
          font-weight: 700;
          letter-spacing: 1px;
        }
        
        .logo-sub {
          color: #c99f47;
          font-size: 0.75rem;
          letter-spacing: 4px;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        
        .logo-area p {
          color: #64748b;
          font-size: 0.95rem;
          margin: 0;
        }
        
        .name-row {
          display: flex;
          gap: 16px;
        }
        
        .input-wrapper {
          position: relative;
          margin-bottom: 20px;
          width: 100%;
        }
        
        .input-wrapper label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 6px;
        }
        
        .input-field-group {
          position: relative;
        }
        
        .field-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }
        
        .input-field-group input {
          width: 100%;
          padding: 13px 16px 13px 48px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.95rem;
          color: #0f172a;
          background-color: #f8fafc;
          transition: all 0.2s ease;
          box-sizing: border-box;
          outline: none;
        }
        
        .input-field-group input:focus {
          border-color: #c99f47;
          background-color: #ffffff;
          box-shadow: 0 0 0 4px rgba(201, 159, 71, 0.1);
        }
        
        .error-message {
          background-color: #fef2f2;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 0.9rem;
          margin-bottom: 20px;
          border-left: 4px solid #dc2626;
        }
        
        .btn-submit {
          width: 100%;
          background: linear-gradient(135deg, #163052 0%, #091d35 100%);
          color: #ffffff;
          padding: 15px;
          border-radius: 12px;
          border: none;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 4px 12px rgba(9, 29, 53, 0.2);
          margin-top: 10px;
        }
        
        .btn-submit:hover {
          background: linear-gradient(135deg, #1d3e68 0%, #112d50 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(9, 29, 53, 0.3);
        }
        
        .btn-submit:disabled {
          background: #cbd5e1;
          color: #94a3b8;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .toggle-auth-area {
          text-align: center;
          margin-top: 25px;
          font-size: 0.9rem;
          color: #64748b;
        }
        
        .btn-toggle-link {
          background: none;
          border: none;
          color: #c99f47;
          font-weight: 600;
          cursor: pointer;
          padding: 0 5px;
          font-size: 0.9rem;
          text-decoration: underline;
        }
        .btn-toggle-link:hover {
          color: #a88132;
        }
      `}</style>

      {/* ฝั่งซ้าย: แบนเนอร์ต้อนรับสุดหรู */}
      <div className="auth-banner">
        <div className="banner-text">
          <h1>{isSignUp ? "ร่วมเป็นส่วนหนึ่งของทีมงานระดับห้าดาว" : "ยกระดับการบริการ สู่มิติใหม่แห่งอนาคต"}</h1>
          <p>สัมผัสประสบการณ์การบริหารจัดการโรงแรมอย่างชาญฉลาดผ่านระบบ AURA ผู้ช่วย AI อัจฉริยะที่เชื่อมต่อทุกภาคส่วนไว้เป็นหนึ่งเดียว</p>
        </div>
      </div>

      {/* ฝั่งขวา: ฟอร์มจัดการระบบ (เข้าสู่ระบบ / สมัครสมาชิก) */}
      <div className="auth-form-container">
        <div className="form-box">
          <div className="logo-area">
            <div className="logo-icon">
              <ConciergeBell size={26} />
            </div>
            <h2>WAN-PAK</h2>
            <div className="logo-sub">Aura Hotel System</div>
            <p>{isSignUp ? "ลงทะเบียนบัญชีสำหรับพนักงานใหม่" : "กรอกข้อมูลเพื่อลงชื่อเข้าใช้งานระบบหลังบ้าน"}</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            {/* ถ้าเป็นหน้าสมัครสมาชิก (isSignUp === true) ให้โชว์ช่องกรอก ชื่อ-นามสกุลเพิ่ม */}
            {isSignUp && (
              <div className="name-row">
                <div className="input-wrapper">
                  <label>ชื่อจริง</label>
                  <div className="input-field-group">
                    <User className="field-icon" size={18} />
                    <input 
                      type="text" 
                      placeholder="สมชาย" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <div className="input-wrapper">
                  <label>นามสกุล</label>
                  <div className="input-field-group">
                    <User className="field-icon" size={18} />
                    <input 
                      type="text" 
                      placeholder="สายเสมอ" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="input-wrapper">
              <label>อีเมลพนักงาน (Email)</label>
              <div className="input-field-group">
                <Mail className="field-icon" size={18} />
                <input 
                  type="email" 
                  placeholder="name@hotel.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="input-wrapper">
              <label>รหัสผ่านความปลอดภัย (Password)</label>
              <div className="input-field-group">
                <Lock className="field-icon" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  กำลังดำเนินการตรวจสอบ...
                </>
              ) : (
                isSignUp ? 'สร้างบัญชีพนักงานใหม่' : 'เข้าสู่ระบบอันทรงเกียรติ'
              )}
            </button>
          </form>

          {/* ปุ่มสลับโหมด Sign In / Sign Up ด้านล่าง */}
          <div className="toggle-auth-area">
            {isSignUp ? "มีบัญชีพนักงานอยู่แล้วใช่ไหม?" : "เป็นพนักงานใหม่ที่ยังไม่มีบัญชี?"}
            <button type="button" className="btn-toggle-link" onClick={toggleAuth}>
              {isSignUp ? "เข้าสู่ระบบที่นี่" : "ลงทะเบียนพนักงานที่นี่"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;