export function LogoMark({ large = false }) {
  return (
    <span className={`logo-mark ${large ? "logo-mark-large" : ""}`.trim()} aria-hidden="true">
      <span className="logo-initial logo-b">B</span>
      <span className="logo-slash" />
      <span className="logo-initial logo-m">M</span>
    </span>
  );
}
