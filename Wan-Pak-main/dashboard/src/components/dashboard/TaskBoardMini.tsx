import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Clock, X } from 'lucide-react';
import type { Ticket } from '../../api';

interface TaskBoardMiniProps {
  tickets: Ticket[];
  initialTab?: 'all' | 'pending' | 'doing' | 'done';
  deptName?: string;
}

type TabKey = 'all' | 'pending' | 'doing' | 'done';

export default function TaskBoardMini({ tickets, initialTab = 'all', deptName }: TaskBoardMiniProps) {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const pendingCount = tickets.filter(t => t.status === 'pending' || t.status === 'รอรับเรื่อง').length;
  const doingCount = tickets.filter(t => t.status === 'doing' || t.status === 'กำลังดำเนินการ' || t.status === 'accepted').length;
  const doneCount = tickets.filter(t => t.status === 'done' || t.status === 'เสร็จสิ้น' || t.status === 'completed').length;

  const filtered = (() => {
    if (activeTab === 'pending') return tickets.filter(t => t.status === 'pending' || t.status === 'รอรับเรื่อง');
    if (activeTab === 'doing') return tickets.filter(t => t.status === 'doing' || t.status === 'กำลังดำเนินการ' || t.status === 'accepted');
    if (activeTab === 'done') return tickets.filter(t => t.status === 'done' || t.status === 'เสร็จสิ้น' || t.status === 'completed');
    return tickets;
  })();

  const statusBadge = (status: string) => {
    if (status === 'pending' || status === 'รอรับเรื่อง') return <span className="badge badge-red">รอดำเนินการ</span>;
    if (status === 'doing' || status === 'กำลังดำเนินการ' || status === 'accepted') return <span className="badge badge-amber">กำลังดำเนินการ</span>;
    if (status === 'done' || status === 'เสร็จสิ้น' || status === 'completed') return <span className="badge badge-green">เสร็จสิ้น</span>;
    return <span className="badge badge-blue">{status}</span>;
  };

  return (
    <div className="dashboard-panel task-panel-gold" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="panel-header">
        <h2 className="panel-title">Task Board / Tickets</h2>
        <NavLink to="/tasks" state={{ defaultDept: deptName || 'all' }} className="panel-link">ดูทั้งหมด</NavLink>
      </div>
      <div className="tabs">
        <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          ทั้งหมด <span className="tab-badge tab-badge-navy">{tickets.length}</span>
        </button>
        <button className={`tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
          รอดำเนินการ <span className="tab-badge">{pendingCount}</span>
        </button>
        <button className={`tab ${activeTab === 'doing' ? 'active' : ''}`} onClick={() => setActiveTab('doing')}>
          กำลังดำเนินการ <span className="tab-badge">{doingCount}</span>
        </button>
        <button className={`tab ${activeTab === 'done' ? 'active' : ''}`} onClick={() => setActiveTab('done')}>
          เสร็จสิ้นแล้ว <span className="tab-badge">{doneCount}</span>
        </button>
      </div>
      <div className="ticket-list" style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '8px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'rgba(9, 29, 53, 0.6)', fontSize: '14px' }}>ไม่มีรายการในหมวดนี้</div>
        ) : filtered.map((t, i) => (
          <div
            key={i}
            className="ticket-item"
            onClick={() => setSelectedTicket(t)}
          >
            <div style={{ fontWeight: 700, color: '#c99f47', minWidth: '60px' }}>
              ห้อง {t.room_number || '?'}
            </div>
            <div>
              {statusBadge(t.status)}
            </div>
            <div className="ticket-name" style={{ flex: 1, fontWeight: 500 }}>
              {t.extracted_data?.items ? (
                <span>
                  {t.extracted_data.items}
                  {t.extracted_data.quantity ? ` ${t.extracted_data.quantity}` : ''}
                  {t.extracted_data.unit ? ` ${t.extracted_data.unit}` : ''}
                </span>
              ) : (t.scenario || '-')}
            </div>
            <div className="ticket-dept" style={{ minWidth: '80px', textAlign: 'center' }}>
              {t.intent || t.extracted_data?.intent || '-'}
            </div>
            <div className="ticket-time" style={{ minWidth: '60px', textAlign: 'right' }}>
              <span className="time-val" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                <Clock size={12} />
                {t.created_at ? new Date(t.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for viewing ticket details like TicketList */}
      {selectedTicket && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 10000, padding: '20px'
        }}>
          <div style={{
            width: '100%', maxWidth: '460px', backgroundColor: '#ffffff',
            borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #f1f5f9', position: 'relative', display: 'flex', flexDirection: 'column',
            maxHeight: '90vh'
          }}>
            <button
              onClick={() => setSelectedTicket(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(241, 245, 249, 0.8)', border: 'none', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
            >
              <X size={18} color="#64748b" />
            </button>

            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header: Room & Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: '48px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{
                    width: '54px', height: '54px', borderRadius: '16px',
                    background: 'linear-gradient(135deg, #091d35 0%, #163052 100%)',
                    color: '#c99f47', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '20px', boxShadow: '0 4px 12px rgba(9, 29, 53, 0.25)'
                  }}>
                    {selectedTicket.room_number || '?'}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#091d35' }}>ห้อง {selectedTicket.room_number || '?'}</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                      <Clock size={14} color="#94a3b8" /> {selectedTicket.created_at ? new Date(selectedTicket.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-'} น.
                    </p>
                  </div>
                </div>
                <div>{statusBadge(selectedTicket.status || '')}</div>
              </div>

              {/* Main Info */}
              <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '16px', border: '1px solid #f1f5f9' }}>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                    สิ่งที่ลูกค้าต้องการ (Scenario)
                  </span>
                  <p style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: 600, lineHeight: '1.5' }}>
                    {selectedTicket.extracted_data?.items || selectedTicket.scenario || selectedTicket.extracted_data?.scenario || '-'}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                    แผนกรับผิดชอบ (Intent)
                  </span>
                  <div style={{ display: 'inline-block', background: '#e2e8f0', color: '#475569', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
                    {selectedTicket.intent || selectedTicket.extracted_data?.intent || '-'}
                  </div>
                </div>
              </div>

              {/* Extracted Data Array/Object Map */}
              {selectedTicket.extracted_data && Object.keys(selectedTicket.extracted_data).length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  <div style={{ background: '#fff1f2', padding: '14px', borderRadius: '12px', border: '1px solid #ffe4e6' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.05em' }}>รายการ</span>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#881337', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {selectedTicket.extracted_data.items || '-'}
                    </div>
                  </div>
                  {selectedTicket.extracted_data.time && (
                    <div style={{ background: '#fefce8', padding: '14px', borderRadius: '12px', border: '1px solid #fef08a', gridColumn: '1 / -1' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#ca8a04', textTransform: 'uppercase', letterSpacing: '0.05em' }}>เวลาที่ต้องการ</span>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#854d0e', marginTop: '6px' }}>
                        {selectedTicket.extracted_data.time}
                      </div>
                    </div>
                  )}
                  {selectedTicket.extracted_data.notes && (
                    <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px dashed #cbd5e1', gridColumn: '1 / -1' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>หมายเหตุเพิ่มเติม</span>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#334155', marginTop: '6px' }}>
                        {selectedTicket.extracted_data.notes}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Audio Demo */}
              <div style={{ marginTop: 'auto', background: '#f8fafc', padding: '12px 16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ position: 'relative', width: '8px', height: '8px' }}>
                    <div style={{ position: 'absolute', inset: 0, background: '#ef4444', borderRadius: '50%' }}></div>
                    <div style={{ position: 'absolute', inset: -4, border: '2px solid #ef4444', borderRadius: '50%', opacity: 0.3 }}></div>
                  </div>
                  บันทึกเสียงลูกค้า (Voice Record)
                </div>
                <audio controls style={{ height: '36px', width: '100%', borderRadius: '8px' }}>
                  <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
                </audio>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
