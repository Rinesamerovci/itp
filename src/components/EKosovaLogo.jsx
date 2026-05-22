import logo2 from "../assets/logo2.svg";

export default function EKosovaLogo({ compact = false }) {
  return (
    <img
      src={logo2}
      alt="eKosova"
      className={compact ? "h-[54px] w-auto" : "h-[66px] w-auto"}
    />
  );
}
