import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getTickets, type Ticket } from '../api';
import { Clock, CheckCircle, RefreshCw, AlertCircle, Search } from 'lucide-react';

const TicketList = () => {
  const location = useLocation();
  const defaultDept = location.state?.defaultDept || 'all';

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDept, setSelectedDept] = useState<'all' | 'maintenance' | 'housekeeping' | 'room-service' | 'other'>(defaultDept);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'doing' | 'done'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilterType, setDateFilterType] = useState<'all' | 'date' | 'month'>('all');
  const [filterDateValue, setFilterDateValue] = useState<string>('');
  const fetchTickets = useCallback(async () => {
    try {
      const data = await getTickets();
      // Sort by created_at descending safely
      const sorted = data.sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
      });
      setTickets(sorted);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchTickets();
  };

  useEffect(() => {
    Promise.resolve().then(fetchTickets);
    const interval = setInterval(fetchTickets, 10000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  const getStatusIcon = (status?: string) => {
    if (!status) return <AlertCircle size={14} />;
    switch (status.toLowerCase()) {
      case 'pending':
      case 'รอรับเรื่อง': return <AlertCircle size={14} />;
      case 'accepted':
      case 'กำลังดำเนินการ': return <Clock size={14} />;
      case 'completed':
      case 'เสร็จสิ้น':
      case 'done': return <CheckCircle size={14} />;
      default: return null;
    }
  };

  const getStatusText = (status?: string) => {
    if (!status) return 'รอดำเนินการ';
    switch (status.toLowerCase()) {
      case 'pending':
      case 'รอรับเรื่อง': return 'รอดำเนินการ';
      case 'accepted': return 'กำลังดำเนินการ';
      case 'completed':
      case 'done': return 'เสร็จสิ้น';
      default: return status;
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('th-TH', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const getTicketIntent = (t: Ticket) => (t.intent || t.extracted_data?.intent || '').toLowerCase();
  const isMaintenance = (t: Ticket) => getTicketIntent(t).includes('maintenance') || getTicketIntent(t).includes('ซ่อมบำรุง');
  const isHousekeeping = (t: Ticket) => getTicketIntent(t).includes('housekeeping') || getTicketIntent(t).includes('แม่บ้าน') || getTicketIntent(t).includes('ทำความสะอาด');
  const isRoomService = (t: Ticket) => getTicketIntent(t).includes('room_service') || getTicketIntent(t).includes('food') || getTicketIntent(t).includes('อาหาร') || getTicketIntent(t).includes('รูมเซอร์วิส');
  const isOther = (t: Ticket) => getTicketIntent(t) === 'other' || getTicketIntent(t).includes('อื่นๆ') || (!isMaintenance(t) && !isHousekeeping(t) && !isRoomService(t));

  const filteredTickets = tickets.filter(t => {
    // Check Department
    let deptMatch = true;
    if (selectedDept === 'maintenance') deptMatch = isMaintenance(t);
    if (selectedDept === 'housekeeping') deptMatch = isHousekeeping(t);
    if (selectedDept === 'room-service') deptMatch = isRoomService(t);
    if (selectedDept === 'other') deptMatch = isOther(t);

    // Check Status
    let statusMatch = true;
    const s = (t.status || '').toLowerCase();
    const isPending = s === 'pending' || s === 'รอรับเรื่อง' || !s;
    const isDoing = s === 'accepted' || s === 'กำลังดำเนินการ' || s === 'doing';
    const isDone = s === 'completed' || s === 'เสร็จสิ้น' || s === 'done';

    if (selectedStatus === 'pending') statusMatch = isPending;
    if (selectedStatus === 'doing') statusMatch = isDoing;
    if (selectedStatus === 'done') statusMatch = isDone;

    // Check Search Term
    let searchMatch = true;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const room = (t.room_number || '').toLowerCase();
      const items = (t.extracted_data?.items || '').toLowerCase();
      const notes = (t.extracted_data?.notes || '').toLowerCase();
      const intent = getTicketIntent(t);
      searchMatch = room.includes(term) || items.includes(term) || notes.includes(term) || intent.includes(term);
    }

    // Check Date
    let dateMatch = true;
    if (dateFilterType !== 'all' && filterDateValue && t.created_at) {
      const ticketDate = new Date(t.created_at);
      if (!isNaN(ticketDate.getTime())) {
        const tzOffset = ticketDate.getTimezoneOffset() * 60000;
        const localISOTime = new Date(ticketDate.getTime() - tzOffset).toISOString();
        if (dateFilterType === 'date') {
          dateMatch = localISOTime.split('T')[0] === filterDateValue;
        } else if (dateFilterType === 'month') {
          dateMatch = localISOTime.slice(0, 7) === filterDateValue;
        }
      }
    }

    return deptMatch && statusMatch && searchMatch && dateMatch;
  });

  return (
    <div style={{ width: '100%' }}>
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#091d35', display: 'flex', alignItems: 'center', gap: '16px', fontFamily: "'Playfair Display', 'Prompt', serif" }}>
            รายการแจ้งเตือนทั้งหมด
          </h1>
          <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '15px' }}>
            ติดตามและจัดการคำร้องขอจากลูกค้าแบบเรียลไทม์ (Real-time Task Management)
          </p>
        </div>
        <button
          onClick={handleRefresh}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0',
            background: 'white', color: '#475569', fontWeight: 600, fontSize: '14px',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'กำลังโหลด...' : 'รีเฟรชข้อมูล'}
        </button>
      </div>

      {/* Filters Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>

        {/* Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px', width: '100%', maxWidth: '400px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <Search size={18} color="#94a3b8" style={{ marginRight: '12px' }} />
          <input
            type="text"
            placeholder="ค้นหาห้อง, รายการแจ้งซ่อม, รูมเซอร์วิส..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#091d35', background: 'transparent' }}
          />
        </div>

        {/* Department Filters */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', marginRight: '8px' }}>แผนก:</span>
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'maintenance', label: 'ช่างซ่อมบำรุง' },
            { id: 'housekeeping', label: 'แม่บ้าน' },
            { id: 'room-service', label: 'รูมเซอร์วิส' },
            { id: 'other', label: 'อื่นๆ' }
          ].map(dept => (
            <button
              key={dept.id}
              onClick={() => setSelectedDept(dept.id as 'all' | 'maintenance' | 'housekeeping' | 'room-service' | 'other')}
              style={{
                padding: '6px 16px',
                borderRadius: '20px',
                border: selectedDept === dept.id ? 'none' : '1px solid #e2e8f0',
                background: selectedDept === dept.id ? '#091d35' : 'white',
                color: selectedDept === dept.id ? 'white' : '#475569',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: selectedDept === dept.id ? '0 4px 12px rgba(9, 29, 53, 0.2)' : 'none'
              }}
            >
              {dept.label}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', marginRight: '8px' }}>สถานะ:</span>
          {[
            { id: 'all', label: 'ทุกสถานะ', color: '#091d35' },
            { id: 'pending', label: 'รอดำเนินการ', color: '#ef4444' },
            { id: 'doing', label: 'กำลังดำเนินการ', color: '#eab308' },
            { id: 'done', label: 'เสร็จสิ้น', color: '#22c55e' }
          ].map(status => (
            <button
              key={status.id}
              onClick={() => setSelectedStatus(status.id as 'all' | 'pending' | 'doing' | 'done')}
              style={{
                padding: '6px 16px',
                borderRadius: '20px',
                border: selectedStatus === status.id ? 'none' : '1px solid #e2e8f0',
                background: selectedStatus === status.id ? status.color : 'white',
                color: selectedStatus === status.id ? 'white' : '#475569',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: selectedStatus === status.id ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {status.label}
            </button>
          ))}
        </div>

        {/* Date Filters */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', marginRight: '8px' }}>เวลา:</span>
          <select 
            value={dateFilterType} 
            onChange={(e) => {
              setDateFilterType(e.target.value as 'all' | 'date' | 'month');
              setFilterDateValue('');
            }}
            style={{ padding: '6px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none', color: '#091d35', background: 'white', cursor: 'pointer' }}
          >
            <option value="all">ทั้งหมด</option>
            <option value="date">ระบุวันที่</option>
            <option value="month">ระบุเดือน</option>
          </select>

          {dateFilterType === 'date' && (
            <input 
              type="date" 
              value={filterDateValue}
              onChange={(e) => setFilterDateValue(e.target.value)}
              style={{ padding: '4px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none', color: '#091d35', background: 'white' }}
            />
          )}

          {dateFilterType === 'month' && (
            <input 
              type="month" 
              value={filterDateValue}
              onChange={(e) => setFilterDateValue(e.target.value)}
              style={{ padding: '4px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none', color: '#091d35', background: 'white' }}
            />
          )}
        </div>
      </div>

      {/* Content Area */}
      {filteredTickets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
          <div style={{ color: '#94a3b8', marginBottom: '16px' }}><CheckCircle size={48} /></div>
          <h3 style={{ margin: 0, color: '#475569', fontSize: '18px' }}>ไม่มีรายการแจ้งเตือนในแผนกนี้</h3>
          <p style={{ color: '#94a3b8', marginTop: '8px' }}>ยอดเยี่ยม! คุณจัดการงานทุกอย่างเรียบร้อยแล้ว</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px', alignItems: 'start' }}>
          {filteredTickets.map(ticket => (
            <div key={ticket.ticket_id} style={{
              background: 'white',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: '1px solid #f1f5f9',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
            >

              {/* Header: Room & Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{
                    width: '54px', height: '54px', borderRadius: '16px',
                    background: 'linear-gradient(135deg, #091d35 0%, #163052 100%)',
                    color: '#c99f47', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '20px', boxShadow: '0 4px 12px rgba(9, 29, 53, 0.25)'
                  }}>
                    {ticket.room_number || '?'}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#091d35' }}>ห้อง {ticket.room_number || '?'}</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                      <Clock size={14} color="#94a3b8" /> {formatTime(ticket.created_at)} น.
                    </p>
                  </div>
                </div>
                <span className={`badge badge-${ticket.status}`} style={{ fontSize: '13px', padding: '6px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {getStatusIcon(ticket.status)} {getStatusText(ticket.status)}
                </span>
              </div>

              {/* Main Info */}
              <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '16px', border: '1px solid #f1f5f9' }}>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                    สิ่งที่ลูกค้าต้องการ (Scenario)
                  </span>
                  <p style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: 600, lineHeight: '1.5' }}>
                    {ticket.extracted_data?.items || ticket.scenario || ticket.extracted_data?.scenario || '-'}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                    แผนกรับผิดชอบ (Intent)
                  </span>
                  <div style={{ display: 'inline-block', background: '#e2e8f0', color: '#475569', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
                    {ticket.intent || ticket.extracted_data?.intent || '-'}
                  </div>
                </div>
              </div>

              {/* Extracted Data Array/Object Map */}
              {ticket.extracted_data && Object.keys(ticket.extracted_data).length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  <div style={{ background: '#fff1f2', padding: '14px', borderRadius: '12px', border: '1px solid #ffe4e6' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.05em' }}>รายการ</span>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#881337', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ticket.extracted_data.items || '-'}
                    </div>
                  </div>
                  {ticket.extracted_data.time && (
                    <div style={{ background: '#fefce8', padding: '14px', borderRadius: '12px', border: '1px solid #fef08a', gridColumn: '1 / -1' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#ca8a04', textTransform: 'uppercase', letterSpacing: '0.05em' }}>เวลาที่ต้องการ</span>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#854d0e', marginTop: '6px' }}>
                        {ticket.extracted_data.time}
                      </div>
                    </div>
                  )}

                </div>
              )}



            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketList;
