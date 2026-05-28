import { useState, useEffect } from 'react';
import { getTickets, getStaff } from '../api';
import type { Ticket, Staff } from '../api';
import './Dashboard.css';

// Import sub-components
import SummaryCards from '../components/dashboard/SummaryCards';
import WorkOverviewChart from '../components/dashboard/WorkOverviewChart';
import TaskBoardMini from '../components/dashboard/TaskBoardMini';
import StaffManagementMini from '../components/dashboard/StaffManagementMini';
import DepartmentSummaries from '../components/dashboard/DepartmentSummaries';

export default function Dashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  useEffect(() => {
    getTickets().then(setTickets).catch(console.error);
    getStaff().then(setStaff).catch(console.error);
  }, []);

  const totalTickets = tickets.length;
  const doingCount = tickets.filter(t => t.status === 'doing' || t.status === 'กำลังดำเนินการ' || t.status === 'accepted').length;
  const doneCount = tickets.filter(t => t.status === 'done' || t.status === 'เสร็จสิ้น' || t.status === 'completed').length;
  const onlineStaff = staff.filter(s => s.status === 'online' || s.status === 'checked-in').length;
  const totalStaff = staff.length;


  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-grid">

        {/* ส่วนการ์ดสรุปภาพรวมด้านบนสุด (Summary Cards) */}
        <SummaryCards
          totalTickets={totalTickets}
          doingCount={doingCount}
          doneCount={doneCount}
          onlineStaff={onlineStaff}
          totalStaff={totalStaff}
          tickets={tickets}
        />

        {/* ส่วนกราฟและรายชื่อพนักงาน (ฝั่งซ้าย) และ กระดานงาน (ฝั่งขวา) */}
        <div className="middle-row" style={{ alignItems: 'stretch' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <WorkOverviewChart tickets={tickets} />
            <StaffManagementMini staff={staff} />
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
              <TaskBoardMini tickets={tickets} />
            </div>
          </div>
        </div>

        {/* ส่วนสรุปจำนวนงานแบ่งตามแผนก (Department Summaries) */}
        <div className="bottom-row">
          <DepartmentSummaries tickets={tickets} />
        </div>

      </div>
    </div>
  );
}