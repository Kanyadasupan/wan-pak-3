import { ClipboardList, ClipboardCheck, CheckCircle, Users as UsersIcon } from 'lucide-react';
import type { Ticket } from '../../api';

interface SummaryCardsProps {
  totalTickets: number;
  doingCount: number;
  doneCount: number;
  onlineStaff: number;
  totalStaff: number;
  tickets: Ticket[];
}

export default function SummaryCards({ totalTickets, doingCount, doneCount, onlineStaff, totalStaff, tickets }: SummaryCardsProps) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };
  const isYesterday = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth() && d.getFullYear() === yesterday.getFullYear();
  };

  const todayTotal = tickets.filter(t => t.created_at && isToday(t.created_at)).length;
  const yesterdayTotal = tickets.filter(t => t.created_at && isYesterday(t.created_at)).length;
  const todayDone = tickets.filter(t => t.created_at && isToday(t.created_at) && (t.status === 'done' || t.status === 'เสร็จสิ้น' || t.status === 'completed')).length;
  const yesterdayDone = tickets.filter(t => t.created_at && isYesterday(t.created_at) && (t.status === 'done' || t.status === 'เสร็จสิ้น' || t.status === 'completed')).length;

  const totalDiff = todayTotal - yesterdayTotal;
  const doneDiff = todayDone - yesterdayDone;
  const doingPercent = totalTickets > 0 ? ((doingCount / totalTickets) * 100).toFixed(1) : '0';

  return (
    <div className="summary-row">
      <div className="summary-card summary-card-navy">
        <div className="icon-wrapper icon-navy">
          <ClipboardList size={28} />
        </div>
        <div className="summary-info">
          <h3>งานทั้งหมด</h3>
          <div className="summary-value">{totalTickets} <span>รายการ</span></div>
          <div className={`summary-trend ${totalDiff >= 0 ? 'trend-up' : 'trend-neutral'}`}>
            {totalDiff >= 0 ? `↑ +${totalDiff}` : `↓ ${totalDiff}`} จากเมื่อวาน
          </div>
        </div>
      </div>
      <div className="summary-card summary-card-gold">
        <div className="icon-wrapper icon-gold">
          <ClipboardCheck size={28} />
        </div>
        <div className="summary-info">
          <h3>งานที่กำลังดำเนินการ</h3>
          <div className="summary-value">{doingCount} <span>รายการ</span></div>
          <div className="summary-trend trend-neutral">{doingPercent}% ของทั้งหมด</div>
        </div>
      </div>
      <div className="summary-card summary-card-green">
        <div className="icon-wrapper icon-green">
          <CheckCircle size={28} />
        </div>
        <div className="summary-info">
          <h3>งานที่เสร็จสิ้น</h3>
          <div className="summary-value">{doneCount} <span>รายการ</span></div>
          <div className={`summary-trend ${doneDiff >= 0 ? 'trend-up' : 'trend-neutral'}`}>
            {doneDiff >= 0 ? `↑ +${doneDiff}` : `↓ ${doneDiff}`} จากเมื่อวาน
          </div>
        </div>
      </div>
      <div className="summary-card summary-card-orange">
        <div className="icon-wrapper icon-orange">
          <UsersIcon size={28} />
        </div>
        <div className="summary-info">
          <h3>พนักงานออนไลน์</h3>
          <div className="summary-value">{onlineStaff} <span>คน</span></div>
          <div className="summary-trend trend-neutral">จากทั้งหมด {totalStaff} คน</div>
        </div>
      </div>
    </div>
  );
}
