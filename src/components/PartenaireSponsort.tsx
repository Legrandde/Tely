import React from "react";
import { Bird, Ghost, LayoutGrid, GitBranch, Sparkles } from "lucide-react";

type PartainerSponsorProps = {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>> | null;
};

const partners: PartainerSponsorProps[] = [
  { name: "Duolingo", icon: Bird },
  { name: "Magic Leap", icon: Ghost },
  { name: "Microsoft", icon: LayoutGrid },
  { name: "Codecov", icon: GitBranch },
  { name: "UserTesting", icon: Sparkles },
];

// item logo
function PartnerLogo({ name, icon: Icon }: PartainerSponsorProps) {
  return (
    <div className="flex items-center gap-2 shrink-0 opacity-80">
      {Icon && <Icon className="text-black" strokeWidth={2} />}
      <span className="text-black font-bold text-lg">{name}</span>
    </div>
  );
}

// defilement infini
export default function PartainerSponsor() {
  const track = [...partners, ...partners];

  return (
    <div className="flex w-full flex-col items-center gap-4 bg-amber-50 py-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-black/60">
        Ils nous font confiance
      </p>

      <div className="w-full overflow-hidden">
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
    </div>
  );
}
