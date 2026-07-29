import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center font-sans p-6">
      <div className="w-full max-w-[860px] animate-[fadeSlideIn_.5s_ease_both]">
        <div className="bg-white rounded-lg flex flex-col md:flex-row w-full overflow-hidden min-h-[500px]">
          {/* Image panel - commune aux deux formulaires */}
          <div className="hidden md:block md:w-[42%] shrink-0 relative overflow-hidden">
            <img
              src="https://i.pinimg.com/736x/ae/c5/7c/aec57c021d6ffac7e28208c9599b61af.jpg"
              alt="Tely E-learning visual"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-amber-430 via-transparent to-transparent" />
          </div>

          {/* Contenu du formulaire (Outlet) */}
          <div className="flex-1 px-8 py-12 md:px-11 flex flex-col justify-center">
            <Outlet />
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
}