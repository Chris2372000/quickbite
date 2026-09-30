export default function Logo({ size = 34, text = true, className = "" }) {
  return (
    <span className={`qb-logo ${className}`}>
      <img src="/logo-mark.svg" width={size} height={size} alt={text ? "" : "QuickBite"} />
      {text && (
        <span className="qb-logo-text">
          Quick<b>Bite</b>
        </span>
      )}
    </span>
  );
}
