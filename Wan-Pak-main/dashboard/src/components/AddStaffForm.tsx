import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase'; // ตรวจสอบ Path ให้ตรงกับของคุณ
import '../index.css';

interface AddStaffFormProps {
  onSuccess?: () => void;
}

const AddStaffForm: React.FC<AddStaffFormProps> = ({ onSuccess }) => {
  // ปรับข้อมูลให้ตรงกับฐานข้อมูลหลัก
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'Room Service' // ตั้งค่าเริ่มต้นให้ตรงกับระบบหลัก
  });
  const [loading, setLoading] = useState(false);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // บันทึกข้อมูลลง Firestore โดยใช้โครงสร้างฟิลด์เดียวกันกับระบบหลัก
      await setDoc(doc(db, "staff", userCredential.user.uid), {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: 'pending', // สถานะเริ่มต้น
        createdAt: new Date()
      });

      alert('เพิ่มพนักงานสำเร็จ!');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการเพิ่มพนักงาน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: '#091d35', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>เพิ่มพนักงานใหม่</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>กรอกข้อมูลเพื่อสร้างบัญชีสำหรับพนักงาน</p>
      </div>

      <form onSubmit={handleAddStaff}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '14px', fontWeight: 600, color: '#091d35' }}>ชื่อ-นามสกุล พนักงาน</label>
          <input 
            type="text" 
            placeholder="เช่น สมชาย ใจดี"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '8px', boxSizing: 'border-box' }} 
            required 
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '14px', fontWeight: 600, color: '#091d35' }}>ตำแหน่ง (Role)</label>
          <select 
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})} 
            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '8px', backgroundColor: 'white', boxSizing: 'border-box' }}
          >
            <option value="Room Service">Room Service</option>
            <option value="Front Desk">Front Desk</option>
            <option value="แม่บ้าน (Housekeeping)">แม่บ้าน (Housekeeping)</option>
            <option value="ช่างเทคนิค (Maintenance)">ช่างเทคนิค (Maintenance)</option>
            <option value="รปภ. (Security)">รปภ. (Security)</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '14px', fontWeight: 600, color: '#091d35' }}>อีเมล</label>
          <input 
            type="email" 
            placeholder="example@hotel.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '8px', boxSizing: 'border-box' }} 
            required 
          />
        </div>
        
        <div style={{ marginBottom: '32px' }}>
          <label style={{ fontSize: '14px', fontWeight: 600, color: '#091d35' }}>รหัสผ่าน</label>
          <input 
            type="password" 
            placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '8px', boxSizing: 'border-box' }} 
            required 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', background: '#c99f47', color: '#091d35', padding: '16px', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', transition: 'all 0.2s', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'กำลังเพิ่มข้อมูล...' : 'ยืนยันการเพิ่มพนักงาน'}
        </button>
      </form>
    </div>
  );
};

export default AddStaffForm;