export function ButtonLink({ children, href, variant = "primary", className = "", onClick }) {
  const isExternal = href?.startsWith("http");

  return (
    <a
      className={`button button-${variant} ${className}`.trim()}
      href={href}
      onClick={onClick}
      rel={isExternal ? "noreferrer" : undefined}
      target={isExternal ? "_blank" : undefined}
    >
      <span>{children}</span>
      <span className="button-arrow" aria-hidden="true">
        -&gt;
      </span>
    </a>
  );
}
