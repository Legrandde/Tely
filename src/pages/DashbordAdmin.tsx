import { Outlet } from "react-router-dom";
import DashboardLayout from "../layout/DashBoardLayout";


export default function DashbordAdmin() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}