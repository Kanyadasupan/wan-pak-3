import { useState, useEffect } from 'react';
import { BarChart, PieChart, PhoneCall, CheckCircle, ClipboardList, Timer } from 'lucide-react';
import { getAnalytics, getTickets, type AnalyticsSummary } from '../api';

const Analytics = () => {
  // ส่วนจัดการ State สำหรับเก็บข้อมูลสถิติภาพรวม
  const [stats, setStats] = useState<AnalyticsSummary>({
    total_calls: 0,
    success_rate: '0%',
    escalation_rate: '0%',
    avg_talk_time: '0 วินาที',
    top_scenarios: {}
  });

  // ส่วนจัดการ State สำหรับเก็บข้อมูลเชิงลึก (เวลาแก้ไขปัญหา, คำขอยอดฮิต, จำนวนตั๋ว, อัตราความสำเร็จ)
  const [avgResolutionTime, setAvgResolutionTime] = useState<number>(0);
  const [topRequests, setTopRequests] = useState<{name: string, count: number}[]>([]);
  const [totalTickets, setTotalTickets] = useState<number>(0);
  const [completionRate, setCompletionRate] = useState<number>(0);

  // ฟังก์ชันดึงข้อมูลจาก API และคำนวณสถิติต่างๆ (Fetch & Calculate Analytics Data)
  const loadData = async () => {
    try {
      const data = await getAnalytics();
      setStats(data);
      
      const tickets = await getTickets();
      setTotalTickets(tickets.length);
      
      let totalResolutionTime = 0;
      let resolvedCount = 0;
      const requestCounts: Record<string, number> = {};

      tickets.forEach(ticket => {
        // Calculate resolution time
        if (ticket.status === 'completed' || ticket.status === 'done' || ticket.status === 'เสร็จสิ้น') {
          const created = new Date(ticket.created_at).getTime();
          const updated = new Date(ticket.updated_at).getTime();
          if (updated > created && (updated - created) < 86400000) { // less than 24h to avoid outliers
            totalResolutionTime += (updated - created);
            resolvedCount++;
          }
        }

        // Calculate top requests
        let item = ticket.extracted_data?.items || ticket.intent || ticket.scenario;
        if (item) {
          // simple formatting for common intents
          if (item === 'request_items') item = ticket.extracted_data?.items || 'ขอของเพิ่ม';
          if (item === 'room_service') item = 'สั่งอาหาร';
          if (item === 'cleaning') item = 'ทำความสะอาด';
          
          requestCounts[item] = (requestCounts[item] || 0) + 1;
        }
      });

      setAvgResolutionTime(resolvedCount > 0 ? Math.round(totalResolutionTime / resolvedCount / 60000) : 0);
      setCompletionRate(tickets.length > 0 ? Math.round((resolvedCount / tickets.length) * 100) : 0);

      const sortedRequests = Object.entries(requestCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
      
      setTopRequests(sortedRequests);
    } catch (e) {
      console.error(e);
    }
  };

  // ดึงข้อมูลเมื่อโหลดหน้าแรก และตั้งเวลาอัปเดตทุกๆ 10 วินาที (Auto Refresh Data)
  useEffect(() => {
    const initTimer = setTimeout(() => {
      loadData();
    }, 0);
    const interval = setInterval(loadData, 10000);
    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
    };
  }, []);

  // ข้อมูลจำลองสำหรับกราฟแท่ง (Mock Data for charts)
  const weeklyCalls = [
    { day: 'จันทร์', calls: 45, height: '40%' },
    { day: 'อังคาร', calls: 52, height: '50%' },
    { day: 'พุธ', calls: 38, height: '35%' },
    { day: 'พฤหัสฯ', calls: 65, height: '70%' },
    { day: 'ศุกร์', calls: 80, height: '85%' },
    { day: 'เสาร์', calls: 95, height: '100%' },
    { day: 'อาทิตย์', calls: 85, height: '90%' },
  ];

  return (
    <div>
      {/* ส่วนสถิติและตัวชี้วัดหลัก (KPI Summary) */}
      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="dashboard-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(9,29,53,0.05)', color: '#091d35', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardList size={28} />
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>คำขอทั้งหมด</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#091d35' }}>{totalTickets}</div>
          </div>
        </div>

        <div className="dashboard-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={28} />
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>อัตรางานที่เสร็จสิ้น</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#16a34a' }}>{completionRate}%</div>
          </div>
        </div>

        <div className="dashboard-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fdf9eb', color: '#c99f47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Timer size={28} />
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>เวลาเฉลี่ยแก้ปัญหา</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#c99f47' }}>{avgResolutionTime}<span style={{ fontSize: '14px', marginLeft: '4px', fontWeight: 600 }}>นาที</span></div>
          </div>
        </div>

        <div className="dashboard-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(9,29,53,0.05)', color: '#091d35', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PhoneCall size={28} />
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>สายทั้งหมด (Total)</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#091d35' }}>{stats.total_calls}</div>
          </div>
        </div>
      </div>

      <div className="grid-main" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* ส่วนแสดงผลกราฟสถิติ (Charts Section) */}
        <div className="dashboard-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eef1f6', color: '#091d35', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#091d35', fontWeight: 800 }}>ปริมาณสายเรียกเข้าแยกตามวัน</h3>
              <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '13px' }}>ข้อมูลสัปดาห์ปัจจุบัน</p>
            </div>
          </div>

          <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '20px 0 0 0', borderBottom: '1px solid #f1f5f9' }}>
            {weeklyCalls.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12%', height: '100%' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%', paddingBottom: '12px' }}>
                  <div
                    style={{
                      width: '100%',
                      height: item.height,
                      background: 'linear-gradient(180deg, #091d35 0%, #163052 100%)',
                      borderRadius: '8px 8px 0 0',
                      transition: 'height 1s ease-out'
                    }}
                    title={`${item.calls} สาย`}
                  ></div>
                </div>
                <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>{item.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ส่วนแสดงจุดประสงค์การโทรยอดฮิต (Top Scenarios) */}
        <div className="dashboard-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fdf9eb', color: '#c99f47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PieChart size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#091d35', fontWeight: 800 }}>สรุปคำขอที่พบบ่อยที่สุด</h3>
              <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '13px' }}>สิ่งที่แขกเรียกใช้บ่อย</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {topRequests.length === 0 ? (
              <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 0' }}>ไม่มีข้อมูล (No data)</div>
            ) : (
              topRequests.map((req, idx) => {
                const total = totalTickets > 0 ? totalTickets : 1;
                const percentage = Math.round((req.count / total) * 100);
                const colors = ['#091d35', '#163052', '#c99f47', '#94a3b8', '#10b981'];
                const bgColor = colors[idx % colors.length];
                return (
                  <div key={req.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 600, textTransform: 'capitalize', color: '#475569' }}>
                      <span>{req.name.replace('_', ' ')}</span>
                      <span style={{ color: '#091d35' }}>{req.count} ครั้ง ({percentage}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', backgroundColor: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: bgColor, borderRadius: '6px' }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
