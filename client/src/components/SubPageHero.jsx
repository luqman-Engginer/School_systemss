export default function SubPageHero({ title, desc, chip }) {
  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/95 via-slate-950/85 to-sky-950/70" />
      <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-indigo-600/25 blur-3xl" />
      <div className="absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />
      <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        {chip && <span className="chip bg-white/10 text-white backdrop-blur ring-1 ring-white/20">{chip}</span>}
        <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">{title}</h1>
        {desc && <p className="mt-3 max-w-2xl text-white/80 leading-relaxed">{desc}</p>}
      </div>
    </section>
  );
}