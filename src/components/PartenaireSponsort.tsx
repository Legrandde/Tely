import React from "react";
import { Bird, Ghost, LayoutGrid, GitBranch } from "lucide-react";

type PartainerSponsorProps = {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>> | null;
};

const partners: PartainerSponsorProps[] = [
  { name: "duolingo", icon: Bird },
  { name: "magic leap", icon: Ghost },
  { name: "Microsoft", icon: LayoutGrid },
  { name: "Codecov", icon: GitBranch },
  { name: "UserTesting", icon: null },
];

// item logo
function PartnerLogo({ name, icon: Icon }: PartainerSponsorProps) {
  if (name === "UserTesting") {
    return (
      <div className="flex items-center gap-1 shrink-0">
        <span className="bg-white/20 text-black font-bold text-lg px-3 py-1 rounded-full">
          User
        </span>
        <span className="text-black font-bold text-lg">Testing</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      {Icon && (
        <Icon className="text-black" strokeWidth={2} />
      )}
      <span className="text-black font-bold text-lg">{name}</span>
    </div>
  );
}

// defilement infini
export default function PartainerSponsor() {
  const track = [...partners, ...partners];

  return (
    <div className="w-full overflow-hidden bg-linear-to-r bg-gray-100 via-amber-500 to-yellow-50 py-6">
      <style>{`
        @keyframes scroll-x {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-scroll-x {
          animation: scroll-x 18s linear infinite;
        }
      `}</style>

      <div className="flex w-max animate-scroll-x gap-16 px-8">
        {track.map((partner, i) => (
          <PartnerLogo key={i} {...partner} />
        ))}
      </div>
    </div>
  );
}