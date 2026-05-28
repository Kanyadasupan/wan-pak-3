import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getTickets, getStaff } from '../api';
import type { Ticket, Staff } from '../api';
import './Dashboard.css';

import WorkOverviewChart from '../components/dashboard/WorkOverviewChart';
import StaffManagementMini from '../components/dashboard/StaffManagementMini';
import TaskBoardMini from '../components/dashboard/TaskBoardMini';

export default function DepartmentPage() {
  // ดึงชื่อแผนกจาก URL Parameter (เช่น /department/housekeeping)
  const { deptName } = useParams<{ deptName: string }>();
  // ดึง state จาก Link ถ้ามีการส่งแนบมา (เช่น เพื่อให้เปิดแท็บ 'pending' ทันที)
  const location = useLocation();
  const initialTab = location.state?.tab || 'all';

  // State เก็บข้อมูลตั๋วงานและพนักงาน
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  // ดึงข้อมูลเมื่อหน้าโหลด (Fetch Data)
  useEffect(() => {
    getTickets().then(setTickets).catch(console.error);
    getStaff().then(setStaff).catch(console.error);
  }, []);

  // ฟังก์ชันตัวช่วยดึงประเภทงานจาก Ticket (Helper: Extract Intent)
  const getTicketIntent = (t: Ticket) => (t.intent || t.extracted_data?.intent || '').toLowerCase();

  // ฟังก์ชันตรวจสอบประเภทงานแต่ละแผนก (Helper: Check Department Match)
  const isMaintenance = (t: Ticket) => getTicketIntent(t).includes('maintenance') || getTicketIntent(t).includes('ซ่อมบำรุง');
  const isHousekeeping = (t: Ticket) => getTicketIntent(t).includes('housekeeping') || getTicketIntent(t).includes('แม่บ้าน') || getTicketIntent(t).includes('ทำความสะอาด');
  const isRoomService = (t: Ticket) => getTicketIntent(t).includes('room_service') || getTicketIntent(t).includes('food') || getTicketIntent(t).includes('อาหาร') || getTicketIntent(t).includes('รูมเซอร์วิส');
  const isOther = (t: Ticket) => getTicketIntent(t) === 'other' || getTicketIntent(t).includes('อื่นๆ') || (!isMaintenance(t) && !isHousekeeping(t) && !isRoomService(t));

  // กรองตั๋วงานให้แสดงเฉพาะแผนกนี้ (Filter Tickets by Department)
  const filteredTickets = tickets.filter(t => {
    if (deptName === 'maintenance') return isMaintenance(t);
    if (deptName === 'housekeeping') return isHousekeeping(t);
    if (deptName === 'room-service') return isRoomService(t);
    if (deptName === 'other') return isOther(t);
    return false;
  });

  // กรองพนักงานให้แสดงเฉพาะแผนกนี้ (Filter Staff by Department)
  const filteredStaff = staff.filter(s => {
    const role = (s.role || '').toLowerCase();
    if (deptName === 'maintenance') return role.includes('maintenance') || role.includes('ซ่อมบำรุง') || role.includes('ช่าง');
    if (deptName === 'housekeeping') return role.includes('housekeeping') || role.includes('แม่บ้าน');
    if (deptName === 'room-service') return role.includes('room service') || role.includes('room_service') || role.includes('รูมเซอร์วิส') || role.includes('อาหาร');
    if (deptName === 'other') {
      return role.includes('front desk') ||
        role.includes('reception') ||
        role.includes('ต้อนรับ') ||
        role.includes('security') ||
        role.includes('รปภ') ||
        role.includes('other') ||
        role.includes('อื่นๆ') ||
        (!role.includes('maintenance') && !role.includes('ช่าง') && !role.includes('housekeeping') && !role.includes('แม่บ้าน') && !role.includes('room service') && !role.includes('อาหาร'));
    }
    return false;
  });

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-grid">


        {/* ส่วนแสดงผลข้อมูล (Main Content Layout) */}
        <div className="middle-row" style={{ alignItems: 'stretch' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <WorkOverviewChart tickets={filteredTickets} />
            <StaffManagementMini staff={filteredStaff} />
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
              <TaskBoardMini key={`${deptName}-${initialTab}`} tickets={filteredTickets} initialTab={initialTab} deptName={deptName} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
