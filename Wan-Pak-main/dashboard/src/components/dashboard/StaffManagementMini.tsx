import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import type { Staff } from '../../api';

interface StaffManagementMiniProps {
  staff: Staff[];
}

export default function StaffManagementMini({ staff }: StaffManagementMiniProps) {
  const [staffTab, setStaffTab] = useState<'all' | 'online' | 'offline'>('all');

  const isOnline = (status?: string) => ['online', 'checked-in', 'active'].includes(status?.toLowerCase() || '');
  const isOffline = (status?: string) => !isOnline(status);

  const getCategorizedStaff = (tab: 'all' | 'online' | 'offline') => {
    return staff.filter(s => {
      if (tab === 'all') return true;
      if (tab === 'online') return isOnline(s.status);
      if (tab === 'offline') return isOffline(s.status);
      return false;
    });
  };

  const onlineCount = staff.filter(s => isOnline(s.status)).length;
  const offlineCount = staff.filter(s => isOffline(s.status)).length;

  const displayStaff = getCategorizedStaff(staffTab);

  return (
    <div className="dashboard-panel staff-panel-navy">
      <div className="panel-header">
        <h2 className="panel-title">Staff Management</h2>
        <NavLink to="/staff" className="panel-link">ดูทั้งหมด</NavLink>
      </div>
      <div className="tabs">
        <button className={`tab ${staffTab === 'all' ? 'active' : ''}`} onClick={() => setStaffTab('all')}>
          ทั้งหมด <span className="tab-badge tab-badge-navy">{staff.length}</span>
        </button>
        <button className={`tab ${staffTab === 'online' ? 'active' : ''}`} onClick={() => setStaffTab('online')}>
          ออนไลน์ <span className="tab-badge tab-badge-gold">{onlineCount}</span>
        </button>
        <button className={`tab ${staffTab === 'offline' ? 'active' : ''}`} onClick={() => setStaffTab('offline')}>
          ออฟไลน์ <span className="tab-badge">{offlineCount}</span>
        </button>
      </div>
      <div className="staff-list no-scrollbar" style={{ height: '200px', overflowY: 'auto', paddingRight: '8px' }}>
        {displayStaff.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>ไม่มีพนักงานในกลุ่มนี้</div>
        ) : displayStaff.map((s, i) => (
          <div key={i} className="staff-item">
            <div className="staff-info">
              <div className="staff-avatar-container">
                <div className="staff-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#c99f47', color: '#091d35', fontWeight: 700, fontSize: '15px', borderRadius: '50%' }}>
                  {s.name?.charAt(0) || '?'}
                </div>
                {staffTab === 'online' && <div className="staff-status-indicator"></div>}
              </div>
              <div>
                <h4 className="staff-name">{s.name}</h4>
                <p className="staff-role">{s.role}</p>
              </div>
            </div>
            <div className="staff-location">{s.shift || '-'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
