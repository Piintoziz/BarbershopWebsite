
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-barber">
      <Outlet />
    </div>
  );
};

export default AdminLayout;
