import { Outlet } from "react-router-dom";
import ProfesseurLayout from "../layout/ProfesseurLayout";

export default function DashboardProfesseur() {
  return (
    <ProfesseurLayout>
      <Outlet />
    </ProfesseurLayout>
  );
}
