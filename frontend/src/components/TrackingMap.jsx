// A lightweight SVG "map" for live tracking. It's a stylised street grid — swap for
// Leaflet + OpenStreetMap later when you have real courier coordinates.
const ROUTE = [
  [90, 70],
  [250, 70],
  [250, 300],
  [420, 300],
  [420, 190],
];

function pointAt(t) {
  const lens = [];
  let total = 0;
  for (let i = 1; i < ROUTE.length; i++) {
    const l = Math.hypot(ROUTE[i][0] - ROUTE[i - 1][0], ROUTE[i][1] - ROUTE[i - 1][1]);
    lens.push(l);
    total += l;
  }
  let d = Math.max(0, Math.min(1, t)) * total;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i]) {
      const f = lens[i] ? d / lens[i] : 0;
      return [
        ROUTE[i][0] + (ROUTE[i + 1][0] - ROUTE[i][0]) * f,
        ROUTE[i][1] + (ROUTE[i + 1][1] - ROUTE[i][1]) * f,
      ];
    }
    d -= lens[i];
  }
  return ROUTE[ROUTE.length - 1];
}

export default function TrackingMap({ progress = 0, restaurantName = "Restaurant", customerName = "You", pickedUp }) {
  const [cx, cy] = pointAt(progress);
  const path = ROUTE.map((p) => p.join(",")).join(" ");
  return (
    <svg className="qb-map-svg" viewBox="0 0 520 380" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Live route map">
      <rect width="520" height="380" fill="#eef1ff" />
      {[40, 130, 250, 340].map((y) => (
        <rect key={"h" + y} x="0" y={y - 14} width="520" height="28" fill="#fff" />
      ))}
      {[70, 250, 420].map((x) => (
        <rect key={"v" + x} x={x - 14} y="0" width="28" height="380" fill="#fff" />
      ))}
      {[[110, 8], [300, 70], [110, 200], [300, 200], [300, 300], [470, 70], [470, 300]].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="70" height="45" rx="6" fill="#dfe5fb" />
      ))}
      <polyline points={path} fill="none" stroke="#00a572" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={pickedUp ? "0" : "2 9"} />
      <polyline points={path} fill="none" stroke="#ff5722" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 8" opacity={pickedUp ? 1 : 0.35} />

      <g transform={`translate(${ROUTE[0][0]} ${ROUTE[0][1]})`}>
        <circle r="9" fill="#00a572" stroke="#fff" strokeWidth="3" />
        <text x="16" y="-12" fontSize="11" fontWeight="700" fill="#141b2b">{restaurantName}</text>
      </g>
      <g transform={`translate(${ROUTE[ROUTE.length - 1][0]} ${ROUTE[ROUTE.length - 1][1]})`}>
        <circle r="12" fill="#ff5722" stroke="#fff" strokeWidth="3" />
        <circle r="4" fill="#fff" />
        <text x="18" y="4" fontSize="11" fontWeight="700" fill="#141b2b">{customerName}</text>
      </g>
      <g transform={`translate(${cx} ${cy})`}>
        <circle r="15" fill="#ff5722" opacity="0.18" />
        <circle r="10" fill="#141b2b" stroke="#fff" strokeWidth="3" />
        <text textAnchor="middle" y="4" fontSize="11">🛵</text>
      </g>
    </svg>
  );
}
