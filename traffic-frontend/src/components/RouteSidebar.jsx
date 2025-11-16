// src/components/RouteSidebar.jsx
import "../styles/RouteSidebar.css";

export default function RouteSidebar({ data, onClose }) {
  if (!data) return null;

  return (
    <div className="route-sidebar">
        <div className="route-sidebar-title">Route Summary</div>

        {/* Start & End */}
        <div className="route-sidebar-info">
        <span className="route-sidebar-label">Start:</span>
        {data.startLocation}
        </div>

        <div className="route-sidebar-info">
        <span className="route-sidebar-label">End:</span>
        {data.endLocation}
        </div>

        <div className="route-sidebar-line"></div>

        {/* Distance */}
        <div className="route-sidebar-info">
        <span className="route-sidebar-label">Distance:</span>
        {data.distance} km
        </div>

        {/* Travel Times */}
        <div className="route-sidebar-info">
        <span className="route-sidebar-label">Time (with traffic):</span>
        {data.trafficTime} min
        </div>

        <div className="route-sidebar-info">
        <span className="route-sidebar-label">Free-flow Time:</span>
        {data.noTrafficTime} min
        </div>

        <div className="route-sidebar-info">
        <span className="route-sidebar-label">Historic Avg Time:</span>
        {data.historicTime} min
        </div>

        <div className="route-sidebar-info">
        <span className="route-sidebar-label">Incidents Delay Time:</span>
        {data.incidentTime} min
        </div>

        {/* Traffic metrics */}
        <div className="route-sidebar-info">
        <span className="route-sidebar-label">Traffic Delay:</span>
        {data.delay} min
        </div>

        <button className="route-sidebar-close" onClick={onClose}>Close</button>
    </div>
  );
}
