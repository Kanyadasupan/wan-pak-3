import { useState, useEffect } from 'react';
import { Users, Plus, X, Search, LogOut, History} from 'lucide-react';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getGuests, type Guest } from '../api';
import Swal from 'sweetalert2';

const GuestList = () => {
  // ส่วนจัดการ State สำหรับเก็บรายชื่อแขก
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  // Modal State สำหรับเพิ่มแขก
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newGuest, setNewGuest] = useState({
    room_number: '',
    guest_name: '',
    phone_number: '',
    check_out_date: '',
    status: 'checked-in'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ฟังก์ชันเพิ่มผู้เข้าพักลง Database
  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuest.room_number || !newGuest.guest_name) {
      Swal.fire({ title: 'ข้อมูลไม่ครบ', text: 'กรุณากรอกเลขห้องและชื่อลูกค้า', icon: 'warning', confirmButtonColor: '#091d35' });
      return;
    }
    setIsSubmitting(true);
    try {
      await setDoc(doc(db, "guests", newGuest.room_number), {
        ...newGuest
      });
      Swal.fire({ title: 'สำเร็จ!', text: 'เพิ่มข้อมูลลูกค้าเรียบร้อยแล้ว', icon: 'success', confirmButtonColor: '#091d35' });
      setIsAddModalOpen(false);
      setNewGuest({
        room_number: '',
        guest_name: '',
        phone_number: '',
        check_out_date: '',
        status: 'checked-in'
      });
      loadGuests(); // ดึงข้อมูลใหม่มาแสดง
    } catch (error) {
      console.error("Error adding guest: ", error);
      Swal.fire({ title: 'ผิดพลาด!', text: 'เกิดข้อผิดพลาดในการเพิ่มลูกค้า', icon: 'error', confirmButtonColor: '#ef4444' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async (guest: Guest) => {
    const result = await Swal.fire({
      title: 'ยืนยันการเช็คเอาท์',
      text: `ยืนยันการเช็คเอาท์ห้อง ${guest.room_number}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#091d35',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก'
    });
    if (!result.isConfirmed) return;
    try {
      await updateDoc(doc(db, "guests", guest.room_number), {
        status: 'checked-out',
        check_out_date: new Date().toISOString().split('T')[0]
      });
      loadGuests();
      Swal.fire({ title: 'สำเร็จ!', text: 'เช็คเอาท์สำเร็จแล้ว', icon: 'success', confirmButtonColor: '#091d35' });
    } catch (error) {
      console.error(error);
      Swal.fire({ title: 'ผิดพลาด!', text: 'เกิดข้อผิดพลาดในการเช็คเอาท์', icon: 'error', confirmButtonColor: '#ef4444' });
    }
  };

  // ฟังก์ชันดึงข้อมูลรายชื่อแขกจาก API (Fetch Guests)
  const loadGuests = async () => {
    try {
      const data = await getGuests();
      setGuests(data);
    } catch (e) {
      console.error(e);
    }
  };

  // ดึงข้อมูลเมื่อโหลดหน้าครั้งแรก และตั้งเวลาดึงข้อมูลใหม่ทุกๆ 10 วินาที (Auto Refresh)
  useEffect(() => {
    const initTimer = setTimeout(() => {
      loadGuests();
    }, 0);
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadGuests, 10000);
    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
    };
  }, []);

  const filteredGuests = guests.filter(g => {
    // กรองตาม Tab
    if (activeTab === 'current' && g.status === 'checked-out') return false;
    if (activeTab === 'history' && g.status !== 'checked-out') return false;
    
    // กรองตามการค้นหา
    return (g.guest_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (g.room_number || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      {/* ส่วนตารางแสดงรายชื่อแขกทั้งหมด (Guest List Table) */}
      <div className="dashboard-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#eef1f6', color: '#091d35', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={28} />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#091d35' }}>รายชื่อแขกทั้งหมด</h2>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>รายชื่อผู้เข้าพักและสถานะปัจจุบัน</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="ค้นหาชื่อ หรือ เลขห้อง..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '10px 16px 10px 38px', borderRadius: '12px',
                  border: '1px solid #e2e8f0', fontSize: '14px',
                  outline: 'none', width: '240px', transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#091d35'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '12px',
                background: '#091d35', color: '#c99f47',
                border: 'none', fontWeight: 700, fontSize: '14px',
                cursor: 'pointer', boxShadow: '0 4px 12px rgba(9, 29, 53, 0.15)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            >
              <Plus size={18} />
              เพิ่มผู้เข้าพัก
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
          <button
            onClick={() => setActiveTab('current')}
            style={{
              background: 'none', border: 'none', fontSize: '15px', fontWeight: activeTab === 'current' ? 700 : 600,
              color: activeTab === 'current' ? '#091d35' : '#64748b', cursor: 'pointer',
              borderBottom: activeTab === 'current' ? '3px solid #091d35' : '3px solid transparent', paddingBottom: '12px',
              transition: 'all 0.2s', marginBottom: '-1px'
            }}
          >
            ผู้เข้าพักปัจจุบัน
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              background: 'none', border: 'none', fontSize: '15px', fontWeight: activeTab === 'history' ? 700 : 600,
              color: activeTab === 'history' ? '#091d35' : '#64748b', cursor: 'pointer',
              borderBottom: activeTab === 'history' ? '3px solid #091d35' : '3px solid transparent', paddingBottom: '12px',
              transition: 'all 0.2s', marginBottom: '-1px'
            }}
          >
            ประวัติการเข้าพัก
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '13px' }}>ห้องพัก</th>
                <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '13px' }}>ชื่อ-นามสกุล</th>
                <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '13px' }}>เบอร์โทร</th>
                <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '13px' }}>สถานะ</th>
                <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '13px' }}>วันที่เช็คเอาท์</th>
                <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '13px', textAlign: 'right' }}>จัดการ (Action)</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map((guest, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '16px', fontWeight: 700, color: '#091d35' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(9, 29, 53, 0.05)', color: '#091d35', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>
                        {guest.room_number}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontWeight: 600, color: '#475569' }}>{guest.guest_name}</td>
                  <td style={{ padding: '16px', color: '#64748b', fontSize: '14px' }}>{guest.phone_number || '-'}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                      background: guest.status === 'checked-in' ? '#dcfce7' : '#f1f5f9',
                      color: guest.status === 'checked-in' ? '#16a34a' : '#64748b'
                    }}>
                      {guest.status === 'checked-in' ? 'In-house' : guest.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#64748b', fontSize: '14px' }}>{guest.check_out_date}</td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      {guest.status === 'checked-in' ? (
                        <button
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '8px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                            border: '1px solid #ef4444', background: 'white', color: '#ef4444', cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
                          onClick={() => handleCheckOut(guest)}
                        >
                          <LogOut size={14} />
                          Check-out
                        </button>
                      ) : (
                        <button
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '8px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                            border: '1px solid #3b82f6', background: '#eff6ff', color: '#2563eb', cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#dbeafe'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#eff6ff'; }}
                          onClick={() => alert(`ประวัติการเข้าพักของ ${guest.guest_name}\nห้อง: ${guest.room_number}\nสถานะ: ${guest.status}`)}
                        >
                          <History size={14} />
                          ประวัติการเข้าพัก
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Guest */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(9, 29, 53, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white', borderRadius: '24px', padding: '32px',
            width: '100%', maxWidth: '500px', boxShadow: '0 24px 48px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#091d35' }}>เพิ่มผู้เข้าพักใหม่</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddGuest} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>เลขห้องพัก *</label>
                <input
                  required
                  type="text"
                  placeholder="เช่น 101, 204"
                  value={newGuest.room_number}
                  onChange={e => setNewGuest({ ...newGuest, room_number: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>ชื่อ-นามสกุลลูกค้า *</label>
                <input
                  required
                  type="text"
                  placeholder="เช่น คุณวิชาญ สุขใจ"
                  value={newGuest.guest_name}
                  onChange={e => setNewGuest({ ...newGuest, guest_name: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  placeholder="เช่น 081-234-5678"
                  value={newGuest.phone_number}
                  onChange={e => setNewGuest({ ...newGuest, phone_number: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>วันที่เช็คเอาท์ (ถ้ามี)</label>
                <input
                  type="date"
                  value={newGuest.check_out_date}
                  onChange={e => setNewGuest({ ...newGuest, check_out_date: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>สถานะ</label>
                <select
                  value={newGuest.status}
                  onChange={e => setNewGuest({ ...newGuest, status: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px', backgroundColor: 'white' }}
                >
                  <option value="checked-in">In-house (checked-in)</option>
                  <option value="checked-out">Checked-out</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: '#f1f5f9', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: '#091d35', color: '#c99f47', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestList;
