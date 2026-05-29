import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase'; // ตรวจสอบ Path ให้ตรงกับของคุณ
import Swal from 'sweetalert2';
import '../index.css';

const SignUp = () => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'พนักงานทั่วไป' });
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // บันทึกข้อมูลเพิ่มเติมนอกจากอีเมลลง Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        createdAt: new Date()
      });

      await Swal.fire({
        title: 'สำเร็จ!',
        text: 'สมัครสมาชิกสำเร็จ!',
        icon: 'success',
        confirmButtonColor: '#091d35',
        confirmButtonText: 'ตกลง'
      });
      navigate('/'); // เปลี่ยนหน้าไปที่หน้าหลักหลังสมัครเสร็จ
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'ผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการสมัครสมาชิก',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row-reverse', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {/* Left Side - Image Background (คงเดิม) */}
      <div style={{ flex: 1.2, position: 'relative' }} className="auth-image-side">
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'linear-gradient(135deg, rgba(9, 29, 53, 0.85) 0%, rgba(9, 29, 53, 0.4) 100%), url("/bg-hotel.png")',
          backgroundSize: 'cover', backgroundPosition: 'center',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px'
        }}>
          <h1 style={{ color: 'white', fontSize: '3rem', fontFamily: "'Playfair Display', serif", fontWeight: 700, margin: '0 0 16px 0', lineHeight: 1.2 }}>
            Join the Era of<br/>Smart Hospitality
          </h1>
        </div>
      </div>

      {/* Right Side - Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px 24px', backgroundColor: '#f8fafc' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ color: '#091d35', fontSize: '1.8rem', fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>สร้างบัญชีใหม่</h1>
          </div>

          <form onSubmit={handleSignUp}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '14px', fontWeight: 600 }}>ชื่อ</label>
                <input type="text" onChange={(e) => setFormData({...formData, firstName: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '8px' }} required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '14px', fontWeight: 600 }}>นามสกุล</label>
                <input type="text" onChange={(e) => setFormData({...formData, lastName: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '8px' }} required />
              </div>
            </div>

            {/* เพิ่มส่วนเลือก Role */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600 }}>ตำแหน่ง (Role)</label>
              <select onChange={(e) => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '8px', backgroundColor: 'white' }}>
                <option value="พนักงานทั่วไป">พนักงานทั่วไป</option>
                <option value="แม่บ้าน">แม่บ้าน</option>
                <option value="พนักงานต้อนรับ">พนักงานต้อนรับ</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600 }}>อีเมล</label>
              <input type="email" onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '8px' }} required />
            </div>
            
            <div style={{ marginBottom: '32px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600 }}>รหัสผ่าน</label>
              <input type="password" onChange={(e) => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '8px' }} required />
            </div>

            <button type="submit" style={{ width: '100%', background: '#c99f47', color: '#091d35', padding: '16px', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
              สมัครสมาชิก
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
