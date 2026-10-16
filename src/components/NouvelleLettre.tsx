export default function NewsletterSection() {
  return (
    <section className="relative w-full -mt-12 rounded-tl-[50px] bg-yellow-50 px-4 pb-12 pt-10 sm:-mt-24 sm:rounded-tl-[100px] sm:px-6 sm:pb-20 sm:pt-16">
      <div className="mx-auto max-w-3xl rounded-3xl bg-linear-to-br from-amber-50 to-amber-50 px-5 py-8 text-center shadow-xl sm:px-8 sm:py-12">
        <h2 className="text-2xl font-extrabold text-amber-500 sm:text-3xl">Get In Touch!</h2>
        <p className="mx-auto mt-2 max-w-md text-start text-black/80">
          Subscribe Us to get in touch and to enjoy discounts, promos and much more!
        </p>

        {/* empile sur mobile, cote a cote a partir de sm */}
        <div className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            placeholder="Enter your email..."
            className="w-full rounded-full bg-white px-5 py-3 text-sm text-slate-500 outline-none"
          />
          <button className="w-full shrink-0 rounded-full bg-white px-6 py-3 font-bold text-gray-600 sm:w-auto">
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
}