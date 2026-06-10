import ChartSection from "../components/ChartSection";
import StatCard from "../components/ui/StatCard";
import UsersPage from "../components/userPage";
import DashboardLayout from "../layout/DashBoardLayout";

export default function DashbordAdmin() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-7">

        {/* ── Stat Cards ── */}
        <div className="flex gap-4 justify-center">
          <StatCard label="Views"        value={7265} percent={11.01}                        />
          <StatCard label="Utilisateurs" value={1240} percent={12}   bgColor="bg-amber-50"   />
          <StatCard label="Professeurs"  value={86}   percent={3.5}  bgColor="bg-green-50"   />
          <StatCard label="Exercices"    value={340}  percent={-2.1} bgColor="bg-rose-50"    />
          <StatCard label="Examens"      value={58}   percent={8}    bgColor="bg-sky-50"     />
        </div>

        {/* ── Chart + Traffic (même colonnes que Users) ── */}
        <ChartSection />

        {/* ── Users Table + Online ── */}
        <UsersPage />

      </div>
    </DashboardLayout>
  );
}