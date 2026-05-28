import { useState, useEffect } from 'react';
import { Edit2, Save, X, Check, UserPlus, UserCheck, Trash2 } from 'lucide-react';
import { getStaff, updateStaff, deleteStaff, type Staff } from '../api';
import AddStaffForm from '../components/AddStaffForm';

// ข้อมูลกะการทำงาน (Shift Options)
const shifts = [
  { value: 'เช้า • 06:00 - 14:00', label: 'เช้า (06:00 - 14:00)' },
  { value: 'บ่าย • 14:00 - 22:00', label: 'บ่าย (14:00 - 22:00)' },
  { value: 'ดึก • 22:00 - 06:00', label: 'ดึก (22:00 - 06:00)' },
];

// ฟังก์ชันจัดรูปแบบข้อความกะการทำงาน (Format Shift Display)
const formatShift = (shift?: string) => {
  if (!shift) return 'เช้า • 06:00 - 14:00';
  if (shift.includes('•')) return shift;
  if (shift.includes('14:00')) return 'บ่าย • 14:00 - 22:00';
  if (shift.includes('22:00')) return 'ดึก • 22:00 - 06:00';
  return 'เช้า • 06:00 - 14:00';
};

const getStaffDisplayName = (staff: Staff) => {
  if (staff.name) return staff.name;
  if (staff.firstName || staff.lastName) {
    return `คุณ${staff.firstName || ''} ${staff.lastName || ''}`.trim();
  }
  return 'พนักงาน';
};

const getStaffInitial = (staff: Staff) => {
  const name = getStaffDisplayName(staff);
  return name.replace('คุณ', '').trim().charAt(0) || 'พ';
};

const StaffDuty = () => {
  // State จัดการข้อมูลพนักงาน, ฟอร์มแก้ไขข้อมูล และหน้าต่างเพิ่มพนักงาน
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Staff>>({});
  const [showAddModal, setShowAddModal] = useState(false);

  // ฟังก์ชันดึงข้อมูลพนักงานทั้งหมดจาก Backend API (Fetch Staff Data)
  const loadStaff = async () => {
    try {
      const data = await getStaff();
      setStaffList(data);
    } catch (e) {
      console.error(e);
    }
  };

  // โหลดข้อมูลเมื่อหน้าเว็บไซต์แสดงผลครั้งแรก (Load Initial Data)
  useEffect(() => {
    const initTimer = setTimeout(() => {
      loadStaff();
    }, 0);
    return () => clearTimeout(initTimer);
  }, []);

  // ฟังก์ชันสลับโหมดเป็นการแก้ไขข้อมูลพนักงาน (Enable Edit Mode)
  const handleEditClick = (staff: Staff) => {
    setEditingId(staff.id);
    setEditForm({ name: getStaffDisplayName(staff), shift: staff.shift || 'เช้า • 06:00 - 14:00' });
  };

  // ฟังก์ชันบันทึกข้อมูลพนักงานที่ถูกแก้ไขส่งไปอัปเดตบน Backend (Save Edited Data)
  const handleSave = async (id: string) => {
    try {
      await updateStaff(id, editForm);
      setStaffList(staffList.map(s =>
        s.id === id ? { ...s, name: editForm.name || s.name, shift: editForm.shift || s.shift } : s
      ));
      setEditingId(null);
    } catch (e) {
      console.error(e);
    }
  };

  // ฟังก์ชันลบพนักงานออกจากระบบ (Delete Staff)
  const handleDelete = async (id: string) => {
    if (!window.confirm('คุณต้องการลบพนักงานคนนี้ใช่หรือไม่?')) return;
    try {
      await deleteStaff(id);
      setStaffList(staffList.filter(s => s.id !== id));
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการลบพนักงาน');
    }
  };

  // ฟังก์ชันกดปุ่มเช็คอิน/เช็คเอาท์ สลับสถานะของพนักงาน (Toggle Check-In/Pending Status)
  const toggleCheckIn = async (id: string) => {
    const staff = staffList.find(s => s.id === id);
    if (!staff) return;

    const newStatus = staff.status === 'checked-in' ? 'pending' : 'checked-in';
    try {
      await updateStaff(id, { status: newStatus });
      setStaffList(staffList.map(s =>
        s.id === id ? { ...s, status: newStatus } : s
      ));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      {/* ส่วนปุ่มเพิ่มพนักงาน (Add Staff Button) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: '#091d35', color: '#c99f47', 
            border: 'none', padding: '12px 20px', borderRadius: '12px',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(9, 29, 53, 0.15)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
        >
          <UserPlus size={18} />
          เพิ่มพนักงาน
        </button>
      </div>

      {/* ส่วนหน้าต่างเพิ่มพนักงาน (Add Staff Modal) */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(9, 29, 53, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '500px', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)' }}>
            <button
              onClick={() => setShowAddModal(false)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(9,29,53,0.05)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(9,29,53,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(9,29,53,0.05)'}
            >
              <X size={20} color="#091d35" />
            </button>
            <div style={{ padding: '0' }}>
              <AddStaffForm onSuccess={() => {
                setShowAddModal(false);
                loadStaff();
              }} />
            </div>
          </div>
        </div>
      )}

      {/* ส่วนแสดงรายชื่อพนักงานเข้ากะวันนี้ (Staff List Grid) */}
      <div className="dashboard-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fdf9eb', color: '#c99f47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={28} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '22px', color: '#091d35', fontWeight: 800 }}>พนักงานเข้ากะวันนี้</h3>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>จัดการรายชื่อและสถานะของพนักงาน</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {staffList.map((staff) => (
            <div key={staff.id} style={{ 
              display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative',
              background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '16px',
              padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)' }}
            >

              {/* Edit Controls Top Right */}
              <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 5 }}>
                {editingId === staff.id ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleSave(staff.id)} style={{ padding: '6px', borderRadius: '8px', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer' }} title="บันทึก">
                      <Save size={14} />
                    </button>
                    <button onClick={() => setEditingId(null)} style={{ padding: '6px', borderRadius: '8px', background: '#f1f5f9', color: '#64748b', border: 'none', cursor: 'pointer' }} title="ยกเลิก">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEditClick(staff)} style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(9,29,53,0.05)', border: 'none', color: '#091d35', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(9,29,53,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(9,29,53,0.05)'} title="แก้ไขข้อมูล">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(staff.id)} style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#fecaca'} onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'} title="ลบพนักงาน">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingRight: editingId === staff.id ? '72px' : '64px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', fontSize: '20px', fontWeight: 700, backgroundColor: 'rgba(9,29,53,0.05)', color: '#091d35', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {getStaffInitial(staff)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editingId === staff.id ? (
                    <input
                      type="text"
                      style={{ padding: '8px 12px', marginBottom: '8px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  ) : (
                    <h3 style={{ fontSize: '16px', color: '#091d35', margin: '0 0 4px 0', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getStaffDisplayName(staff)}</h3>
                  )}
                  <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 500 }}>{staff.role || 'พนักงาน'}</div>
                </div>
              </div>

              <div style={{ flexGrow: 1 }}></div>
              <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px -20px' }}></div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>กะการทำงาน</span>
                  {editingId === staff.id ? (
                    <select
                      style={{ padding: '6px 12px', width: '160px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white' }}
                      value={editForm.shift}
                      onChange={(e) => setEditForm({ ...editForm, shift: e.target.value })}
                    >
                      {shifts.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  ) : (
                    <span style={{ fontWeight: 600, fontSize: '13px', color: '#091d35', background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px' }}>{formatShift(staff.shift)}</span>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>สถานะ</span>
                  <button
                    onClick={() => toggleCheckIn(staff.id)}
                    style={{
                      background: staff.status === 'checked-in' ? '#dcfce7' : '#f1f5f9',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '6px',
                      color: staff.status === 'checked-in' ? '#16a34a' : '#64748b',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontWeight: 600, fontSize: '12px',
                      transition: 'all 0.2s ease',
                      boxShadow: staff.status === 'checked-in' ? '0 2px 8px rgba(22, 163, 74, 0.15)' : 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {staff.status === 'checked-in' ? <Check size={14} /> : null}
                    {staff.status === 'checked-in' ? 'เข้างานแล้ว' : 'รอเข้ากะ'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffDuty;
