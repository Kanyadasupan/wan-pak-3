
import Overview from '../components/Overview';
import TicketList from '../components/TicketList';

const TaskBoard = () => {
  return (
    <>
      {/* ส่วนแสดงผลภาพรวม (Overview บล็อกการ์ดสถิติต่างๆ) */}
      <Overview />

      {/* ส่วนตารางรายการคำขอหลักที่ดึงข้อมูลจาก Database */}
      <div className="grid-main">
        <div style={{ gridColumn: '1 / -1' }}>
          <TicketList />
        </div>
      </div>
    </>
  );
};

export default TaskBoard;