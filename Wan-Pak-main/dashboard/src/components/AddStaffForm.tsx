import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { clearStaffCache } from '../api';
import Swal from 'sweetalert2';
import '../index.css';

interface AddStaffFormProps {
  onSuccess?: () => void;
}

const AddStaffForm: React.FC<AddStaffFormProps> = ({ onSuccess }) => {
  // ปรับข้อมูลให้ตรงกับฐานข้อมูลหลัก
  const [formData, setFormData] = useState({ 
    name: '', 
    role: 'Room Service', // ตั้งค่าเริ่มต้นให้ตรงกับระบบหลัก
    shift: 'เช้า • 06:00 - 14:00' // ค่าเริ่มต้นสำหรับกะ
  });
  const [loading, setLoading] = useState(false);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // บันทึกข้อมูลลง Firestore โดยตรง (สร้างเฉพาะ Profile พนักงาน)
      await addDoc(collection(db, "staff"), {
        name: formData.name,
        role: formData.role,
        shift: formData.shift, // เพิ่มกะการทำงาน
        status: 'pending', // สถานะเริ่มต้น (รอเข้ากะ)
        createdAt: new Date()
      });

      await Swal.fire({
        title: 'สำเร็จ!',
        text: 'เพิ่มพนักงานสำเร็จ!',
        icon: 'success',
        confirmButtonColor: '#091d35',
        confirmButtonText: 'ตกลง'
      });
      clearStaffCache();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'ผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการเพิ่มพนักงาน',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'ตกลง'
      });
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
            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '8px', backgroundColor: 'white', boxSizing: 'border-box' }} 
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
          <label style={{ fontSize: '14px', fontWeight: 600, color: '#091d35' }}>กะการทำงาน (Shift)</label>
          <select 
            value={formData.shift}
            onChange={(e) => setFormData({...formData, shift: e.target.value})} 
            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '8px', backgroundColor: 'white', boxSizing: 'border-box' }}
          >
            <option value="เช้า • 06:00 - 14:00">เช้า (06:00 - 14:00)</option>
            <option value="บ่าย • 14:00 - 22:00">บ่าย (14:00 - 22:00)</option>
            <option value="ดึก • 22:00 - 06:00">ดึก (22:00 - 06:00)</option>
            <option value="08:00 - 17:00">กะปกติ (08:00 - 17:00)</option>
          </select>
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