"use client";

import { useState } from "react";
import { MoreHorizontal, Circle, Shield, GraduationCap, BookOpen, Plus } from "lucide-react";

// ─── Data ──────────────────────────────────────────────────────────
const users = [
  { id: 1, name: "Alhassane Diallo", email: "alhassane@tely.sn", phone: "+221 77 123 45 67", role: "Admin",      avatar: "https://i.pravatar.cc/150?img=11" },
  { id: 2, name: "Fatou Balde",      email: "fatou@tely.sn",     phone: "+221 76 234 56 78", role: "Professeur", avatar: "https://i.pravatar.cc/150?img=47" },
  { id: 3, name: "Mamadou Sow",      email: "mamadou@tely.sn",   phone: "+221 70 345 67 89", role: "Étudiant",   avatar: "https://i.pravatar.cc/150?img=15" },
  { id: 4, name: "Aïssatou Kouyaté", email: "aissatou@tely.sn",  phone: "+221 78 456 78 90", role: "Étudiant",   avatar: "https://i.pravatar.cc/150?img=23" },
  { id: 5, name: "Ibrahima Traoré",  email: "ibrahima@tely.sn",  phone: "+221 77 567 89 01", role: "Professeur", avatar: "https://i.pravatar.cc/150?img=18" },
  { id: 6, name: "Mariama Diop",     email: "mariama@tely.sn",   phone: "+221 76 678 90 12", role: "Étudiant",   avatar: "https://i.pravatar.cc/150?img=32" },
  { id: 7, name: "Ousmane Barry",    email: "ousmane@tely.sn",   phone: "+221 70 789 01 23", role: "Étudiant",   avatar: "https://i.pravatar.cc/150?img=52" },
  { id: 8, name: "Kadiatou Camara",  email: "kadiatou@tely.sn",  phone: "+221 78 890 12 34", role: "Professeur", avatar: "https://i.pravatar.cc/150?img=44" },
];

const onlineUsers = [
  { id: 1, name: "Fatou Balde",     role: "Professeur", avatar: "https://i.pravatar.cc/150?img=47" },
  { id: 2, name: "Mamadou Sow",     role: "Étudiant",   avatar: "https://i.pravatar.cc/150?img=15" },
  { id: 3, name: "Ibrahima Traoré", role: "Professeur", avatar: "https://i.pravatar.cc/150?img=18" },
  { id: 4, name: "Mariama Diop",    role: "Étudiant",   avatar: "https://i.pravatar.cc/150?img=32" },
  { id: 5, name: "Ousmane Barry",   role: "Étudiant",   avatar: "https://i.pravatar.cc/150?img=52" },
];

// ─── Helpers ───────────────────────────────────────────────────────
const roleIcon: Record<string, React.ReactNode> = {
  Admin:      <Shield size={16} className="text-gray-400" />,
  Professeur: <GraduationCap size={16} className="text-gray-400" />,
  Étudiant:   <BookOpen size={16} className="text-gray-400" />,
};

// ─── UsersPage ─────────────────────────────────────────────────────
export default function UsersPage() {
  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex gap-4 w-full">

      {/* ── Table principale ── */}
      <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Header table */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-black">Utilisateurs</h2>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm bg-gray-100 rounded-lg h-6 p-3 outline-none w-48 placeholder-gray-400 text-gray-600"
            />
            <button className="bg-amber-500 flex items-center justify-start text-center w-10 hover:bg-amber-600 h-6 transition-colors text-white text-base  p-3 rounded-lg">
              <Plus size={20}/>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 font-medium">Utilisateur</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Téléphone</th>
                <th className="px-5 py-3 font-medium">Rôle</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">

                  {/* Avatar + Nom */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100"
                      />
                      <span className="font-medium text-gray-800">{user.name}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-5 py-3 text-gray-500">{user.email}</td>

                  {/* Téléphone */}
                  <td className="px-5 py-3 text-gray-500">{user.phone}</td>

                  {/* Rôle — icon + texte, sans couleur */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      {roleIcon[user.role]}
                      <span className="text-sm">{user.role}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">{filtered.length} résultats</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors
                  ${p === 1 ? "bg-amber-500 text-white" : "text-gray-400 hover:bg-gray-100"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Users connectés ── */}
      <div className="w-56 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">

        <div>
          <h3 className="text-sm font-semibold text-gray-800">En ligne</h3>
          <p className="text-xs text-gray-400 mt-0.5">{onlineUsers.length} connectés</p>
        </div>

        <div className="flex flex-col gap-3">
          {onlineUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-3">

              {/* Avatar + badge vert */}
              <div className="relative flex-shrink-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <Circle
                  size={10}
                  className="absolute bottom-0 right-0 text-green-500 fill-green-500 bg-white rounded-full"
                />
              </div>

              {/* Nom + rôle */}
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.role}</p>
              </div>

            </div>
          ))}
        </div>

        <button className="mt-auto text-xs text-amber-500 font-semibold hover:underline text-left">
          Voir tous →
        </button>
      </div>

    </div>
  );
}