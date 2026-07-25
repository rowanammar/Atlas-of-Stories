export default function LoadingOverlay() {
  return (
    <div className="loading-overlay">
      <svg className="pl" viewBox="0 0 160 160" width="160px" height="160px" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000"></stop>
            <stop offset="100%" stopColor="#fff"></stop>
          </linearGradient>
          <mask id="mask1">
            <rect x="0" y="0" width="160" height="160" fill="url(#grad)"></rect>
          </mask>
          <mask id="mask2">
            <rect x="28" y="28" width="104" height="104" fill="url(#grad)"></rect>
          </mask>
        </defs>

        {/* Outer ring — base layer */}
        <g>
          <g className="pl__ring-rotate">
            <circle className="pl__ring-stroke" cx="80" cy="80" r="72" fill="none"
              stroke="hsl(30, 60%, 40%)" strokeWidth="16"
              strokeDasharray="452.39 452.39" strokeDashoffset="452"
              strokeLinecap="round" transform="rotate(-45,80,80)"></circle>
          </g>
        </g>
        {/* Outer ring — masked layer */}
        <g mask="url(#mask1)">
          <g className="pl__ring-rotate">
            <circle className="pl__ring-stroke" cx="80" cy="80" r="72" fill="none"
              stroke="hsl(38, 70%, 55%)" strokeWidth="16"
              strokeDasharray="452.39 452.39" strokeDashoffset="452"
              strokeLinecap="round" transform="rotate(-45,80,80)"></circle>
          </g>
        </g>

        {/* Tick marks — base layer */}
        <g>
          <g strokeWidth="4" strokeDasharray="12 12" strokeDashoffset="12"
            strokeLinecap="round" transform="translate(80,80)">
            {[-135, -90, -45, 0, 45, 90, 135, 180].map((angle) => (
              <polyline key={`t1-${angle}`} className="pl__tick"
                stroke="hsl(30, 10%, 60%)" points="0,2 0,14"
                transform={`rotate(${angle},0,0) translate(0,40)`}></polyline>
            ))}
          </g>
        </g>
        {/* Tick marks — masked layer */}
        <g mask="url(#mask1)">
          <g strokeWidth="4" strokeDasharray="12 12" strokeDashoffset="12"
            strokeLinecap="round" transform="translate(80,80)">
            {[-135, -90, -45, 0, 45, 90, 135, 180].map((angle) => (
              <polyline key={`t2-${angle}`} className="pl__tick"
                stroke="hsl(38, 70%, 70%)" points="0,2 0,14"
                transform={`rotate(${angle},0,0) translate(0,40)`}></polyline>
            ))}
          </g>
        </g>

        {/* Arrows — base layer */}
        <g>
          <g transform="translate(64,28)">
            <g className="pl__arrows" transform="rotate(45,16,52)">
              <path fill="hsl(15, 70%, 50%)"
                d="M17.998,1.506l13.892,43.594c.455,1.426-.56,2.899-1.998,2.899H2.108c-1.437,0-2.452-1.473-1.998-2.899L14.002,1.506c.64-2.008,3.356-2.008,3.996,0Z"></path>
              <path fill="hsl(30, 10%, 60%)"
                d="M14.009,102.499L.109,58.889c-.453-1.421,.559-2.889,1.991-2.889H29.899c1.433,0,2.444,1.468,1.991,2.889l-13.899,43.61c-.638,2.001-3.345,2.001-3.983,0Z"></path>
            </g>
          </g>
        </g>
        {/* Arrows — masked layer */}
        <g mask="url(#mask2)">
          <g transform="translate(64,28)">
            <g className="pl__arrows" transform="rotate(45,16,52)">
              <path fill="hsl(0, 55%, 50%)"
                d="M17.998,1.506l13.892,43.594c.455,1.426-.56,2.899-1.998,2.899H2.108c-1.437,0-2.452-1.473-1.998-2.899L14.002,1.506c.64-2.008,3.356-2.008,3.996,0Z"></path>
              <path fill="hsl(38, 70%, 70%)"
                d="M14.009,102.499L.109,58.889c-.453-1.421,.559-2.889,1.991-2.889H29.899c1.433,0,2.444,1.468,1.991,2.889l-13.899,43.61c-.638,2.001-3.345,2.001-3.983,0Z"></path>
            </g>
          </g>
        </g>
      </svg>
      <p className="loading-text">Exploring the literary world…</p>
    </div>
  );
}
