import { useState, useEffect } from 'react';
import { getTickets } from '../api';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

const Overview = () => {
  const [stats, setStats] = useState({
    pending: 0,
    doing: 0,
    completed: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const tickets = await getTickets();
        setStats({
          pending: tickets.filter(t => t.status === 'pending' || t.status === 'รอรับเรื่อง').length,
          doing: tickets.filter(t => t.status === 'doing' || t.status === 'กำลังดำเนินการ' || t.status === 'accepted').length,
          completed: tickets.filter(t => t.status === 'completed' || t.status === 'เสร็จสิ้น' || t.status === 'done').length
        });
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid-cards">
      <div className="card stat-box">
        <div className="stat-icon navy">
          <AlertCircle size={24} />
        </div>
        <div>
          <div className="stat-label">งานที่รอรับเรื่อง</div>
          <div className="stat-value">{stats.pending}</div>
        </div>
      </div>

      <div className="card stat-box">
        <div className="stat-icon yellow">
          <Clock size={24} />
        </div>
        <div>
          <div className="stat-label">กำลังดำเนินการ</div>
          <div className="stat-value">{stats.doing}</div>
        </div>
      </div>

      <div className="card stat-box">
        <div className="stat-icon gray">
          <CheckCircle size={24} />
        </div>
        <div>
          <div className="stat-label">งานที่เสร็จสิ้น</div>
          <div className="stat-value">{stats.completed}</div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
