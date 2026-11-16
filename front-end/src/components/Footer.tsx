export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#070b10]">
      <div className="page-shell flex flex-col gap-3 py-7 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">
          © {new Date().getFullYear()} Moaz Elborollosy
        </p>
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-700">
          Robotics · Automation · Mechatronics
        </p>
      </div>
    </footer>
  );
}
