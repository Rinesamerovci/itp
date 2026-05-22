const topLinks = ["Ndihm\u00eb", "FAQ", "Vegzat", "Webmail"];
const languages = ["Shq", "Eng", "Srb"];

export default function TopUtilityBar() {
  return (
    <div className="h-9 bg-[#f7be2a] text-white">
      <div className="mx-auto flex h-full max-w-[1240px] items-center justify-between px-4 text-[13px] md:px-6">
        <div className="hidden items-center gap-7 md:flex">
          {topLinks.map((label) => (
            <span key={label} className="cursor-default opacity-90">
              {label}
            </span>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className="cursor-default opacity-90">Gjuha:</span>
          {languages.map((label) => (
            <span key={label} className="cursor-default opacity-90">
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
