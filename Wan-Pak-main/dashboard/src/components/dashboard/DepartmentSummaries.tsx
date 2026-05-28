import { NavLink } from 'react-router-dom';
import { Wrench, Sparkles, CheckCircle, ChevronRight, ConciergeBell } from 'lucide-react';
import type { Ticket } from '../../api';

interface DepartmentSummariesProps {
  tickets: Ticket[];
}

export default function DepartmentSummaries({ tickets }: DepartmentSummariesProps) {
  const getTicketIntent = (t: Ticket) => (t.intent || t.extracted_data?.intent || '').toLowerCase();

  const isMaintenance = (t: Ticket) => getTicketIntent(t).includes('maintenance') || getTicketIntent(t).includes('ซ่อมบำรุง');
  const isHousekeeping = (t: Ticket) => getTicketIntent(t).includes('housekeeping') || getTicketIntent(t).includes('แม่บ้าน') || getTicketIntent(t).includes('ทำความสะอาด');
  const isRoomService = (t: Ticket) => getTicketIntent(t).includes('room_service') || getTicketIntent(t).includes('food') || getTicketIntent(t).includes('อาหาร') || getTicketIntent(t).includes('รูมเซอร์วิส');
  const isOther = (t: Ticket) => getTicketIntent(t) === 'other' || getTicketIntent(t).includes('อื่นๆ') || (!isMaintenance(t) && !isHousekeeping(t) && !isRoomService(t));

  const mPending = tickets.filter(t => isMaintenance(t) && (t.status === 'pending' || t.status === 'รอรับเรื่อง')).length;
  const mDoing = tickets.filter(t => isMaintenance(t) && (t.status === 'doing' || t.status === 'กำลังดำเนินการ' || t.status === 'accepted')).length;

  const hkPending = tickets.filter(t => isHousekeeping(t) && (t.status === 'pending' || t.status === 'รอรับเรื่อง')).length;
  const hkDone = tickets.filter(t => isHousekeeping(t) && (t.status === 'done' || t.status === 'เสร็จสิ้น' || t.status === 'completed')).length;

  const rsPending = tickets.filter(t => isRoomService(t) && (t.status === 'pending' || t.status === 'รอรับเรื่อง')).length;
  const rsDoing = tickets.filter(t => isRoomService(t) && (t.status === 'doing' || t.status === 'กำลังดำเนินการ' || t.status === 'accepted')).length;

  const otPending = tickets.filter(t => isOther(t) && (t.status === 'pending' || t.status === 'รอรับเรื่อง')).length;
  const otDoing = tickets.filter(t => isOther(t) && (t.status === 'doing' || t.status === 'กำลังดำเนินการ' || t.status === 'accepted')).length;

  return (
    <div className="bottom-row">
      {/* แผนกซ่อมบำรุง (Maintenance) */}
      <div className="dashboard-panel dept-panel-theme" style={{ padding: '20px' }}>
        <div className="panel-header" style={{ marginBottom: '16px' }}>
          <h2 className="panel-title" style={{ fontSize: '15px' }}>Maintenance</h2>
          <NavLink to="/department/maintenance" className="panel-link">ดูทั้งหมด</NavLink>
        </div>
        <NavLink to="/department/maintenance" state={{ tab: 'pending' }} style={{ textDecoration: 'none' }}>
          <div className="dept-card">
            <div className="dept-info">
              <div className="dept-icon dept-icon-red"><Wrench size={24} /></div>
              <div className="dept-text">
                <h4>รอดำเนินการ</h4>
                <p>{mPending} <span>รายการ</span></p>
              </div>
            </div>
            <ChevronRight size={20} color="#cbd5e1" />
          </div>
        </NavLink>
        <NavLink to="/department/maintenance" state={{ tab: 'doing' }} style={{ textDecoration: 'none' }}>
          <div className="dept-card">
            <div className="dept-info">
              <div className="dept-icon dept-icon-amber"><Wrench size={24} /></div>
              <div className="dept-text">
                <h4>กำลังดำเนินการ</h4>
                <p>{mDoing} <span>รายการ</span></p>
              </div>
            </div>
            <ChevronRight size={20} color="#cbd5e1" />
          </div>
        </NavLink>
      </div>

      {/* แผนกแม่บ้าน (Housekeeping) */}
      <div className="dashboard-panel dept-panel-theme" style={{ padding: '20px' }}>
        <div className="panel-header" style={{ marginBottom: '16px' }}>
          <h2 className="panel-title" style={{ fontSize: '15px' }}>Housekeeping</h2>
          <NavLink to="/department/housekeeping" className="panel-link">ดูทั้งหมด</NavLink>
        </div>
        <NavLink to="/department/housekeeping" state={{ tab: 'pending' }} style={{ textDecoration: 'none' }}>
          <div className="dept-card">
            <div className="dept-info">
              <div className="dept-icon dept-icon-green"><Sparkles size={24} /></div>
              <div className="dept-text">
                <h4>รอดำเนินการ</h4>
                <p>{hkPending} <span>ห้อง</span></p>
              </div>
            </div>
            <ChevronRight size={20} color="#cbd5e1" />
          </div>
        </NavLink>
        <NavLink to="/department/housekeeping" state={{ tab: 'done' }} style={{ textDecoration: 'none' }}>
          <div className="dept-card">
            <div className="dept-info">
              <div className="dept-icon dept-icon-blue"><CheckCircle size={24} /></div>
              <div className="dept-text">
                <h4>ตรวจสอบแล้ว</h4>
                <p>{hkDone} <span>ห้อง</span></p>
              </div>
            </div>
            <ChevronRight size={20} color="#cbd5e1" />
          </div>
        </NavLink>
      </div>

      {/* แผนกรูมเซอร์วิส (Room Service) */}
      <div className="dashboard-panel dept-panel-theme" style={{ padding: '20px' }}>
        <div className="panel-header" style={{ marginBottom: '16px' }}>
          <h2 className="panel-title" style={{ fontSize: '15px' }}>Room Service</h2>
          <NavLink to="/department/room-service" className="panel-link">ดูทั้งหมด</NavLink>
        </div>
        <NavLink to="/department/room-service" state={{ tab: 'pending' }} style={{ textDecoration: 'none' }}>
          <div className="dept-card">
            <div className="dept-info">
              <div className="dept-icon dept-icon-red"><ConciergeBell size={24} /></div>
              <div className="dept-text">
                <h4>รอดำเนินการ</h4>
                <p>{rsPending} <span>ออเดอร์</span></p>
              </div>
            </div>
            <ChevronRight size={20} color="#cbd5e1" />
          </div>
        </NavLink>
        <NavLink to="/department/room-service" state={{ tab: 'doing' }} style={{ textDecoration: 'none' }}>
          <div className="dept-card">
            <div className="dept-info">
              <div className="dept-icon dept-icon-purple"><ConciergeBell size={24} /></div>
              <div className="dept-text">
                <h4>กำลังเตรียม</h4>
                <p>{rsDoing} <span>รายการ</span></p>
              </div>
            </div>
            <ChevronRight size={20} color="#cbd5e1" />
          </div>
        </NavLink>
      </div>

      {/* แผนกอื่นๆ (Other) */}
      <div className="dashboard-panel dept-panel-theme" style={{ padding: '20px' }}>
        <div className="panel-header" style={{ marginBottom: '16px' }}>
          <h2 className="panel-title" style={{ fontSize: '15px' }}>Other / อื่นๆ</h2>
          <NavLink to="/department/other" className="panel-link">ดูทั้งหมด</NavLink>
        </div>
        <NavLink to="/department/other" state={{ tab: 'pending' }} style={{ textDecoration: 'none' }}>
          <div className="dept-card">
            <div className="dept-info">
              <div className="dept-icon dept-icon-red" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}><CheckCircle size={24} /></div>
              <div className="dept-text">
                <h4>รอดำเนินการ</h4>
                <p>{otPending} <span>รายการ</span></p>
              </div>
            </div>
            <ChevronRight size={20} color="#cbd5e1" />
          </div>
        </NavLink>
        <NavLink to="/department/other" state={{ tab: 'doing' }} style={{ textDecoration: 'none' }}>
          <div className="dept-card">
            <div className="dept-info">
              <div className="dept-icon dept-icon-amber" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}><CheckCircle size={24} /></div>
              <div className="dept-text">
                <h4>กำลังดำเนินการ</h4>
                <p>{otDoing} <span>รายการ</span></p>
              </div>
            </div>
            <ChevronRight size={20} color="#cbd5e1" />
          </div>
        </NavLink>
      </div>
    </div>
  );
}
