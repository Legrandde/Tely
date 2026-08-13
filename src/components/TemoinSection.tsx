import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    name: "Alexa Rodriguez",
    role: "Web Developer",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    text: "Enrolling in courses at this eLearning platform was a game-changer for me. Absolutely transformative experience!",
  },
  {
    name: "Emily Chen",
    role: "UI/UX Designer",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    text: "Exceptional courses! The practical insights and flexible learning structure have been instrumental in my professional growth.",
  },
  {
    name: "James Johnson",
    role: "Web Developer",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    text: "Highly recommend! The personalized feedback and real-world application in the courses have elevated my understanding...",
  },
];

// carte temoignage
function TestimonialCard({ name, role, avatar, text }: { name: string; role: string; avatar: string; text: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="flex items-center gap-3">
        <img
          src={avatar}
          alt={name}
          className="h-12 w-12 rounded-full border-2 border-purple-400 object-cover"
        />
        <div>
          <h3 className="font-bold text-purple-600">{name}</h3>
          <p className="text-xs text-slate-400">{role}</p>
          <div className="mt-1 flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500">{text}</p>
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="bg-linear-to-br from-gray-200 to-amber-50 px-6 pb-32 pt-20 w-full">
      <h2 className="text-center text-3xl font-extrabold text-amber-500">Student's Testimonials</h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-sm text-black/80">
        Here's what our students have to say about their transformative learning experience: Real
        stories, real growth. Discover firsthand the impact our courses have had on their lives.
      </p>

      <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <TestimonialCard key={i} {...t} />
        ))}
      </div>

      {/* pagination */}
      <div className="mt-8 flex items-center justify-center gap-4 text-black">
        <button aria-label="Précédent">
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm">01/15</span>
        <button aria-label="Suivant">
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}