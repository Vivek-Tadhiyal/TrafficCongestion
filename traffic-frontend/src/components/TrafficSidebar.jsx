import "../styles/TrafficSidebar.css";

export default function TrafficSidebar({ data, locationName, onClose }) {
  if (!data) return null;

  const seg = data.flowSegmentData;

  return (
    <div className="sidebar">
      <div className="sidebar-title">Traffic Details</div>

      <div className="sidebar-info">
        <span className="sidebar-label">Location:</span> {locationName}
      </div>

      <div className="sidebar-line"></div>

      <div className="sidebar-info">
        <span className="sidebar-label">Current Speed:</span> {seg.currentSpeed} km/h
      </div>

      <div className="sidebar-info">
        <span className="sidebar-label">Free Flow Speed:</span> {seg.freeFlowSpeed} km/h
      </div>

      <div className="sidebar-info">
        <span className="sidebar-label">Road Closure:</span> {seg.roadClosure ? "Yes" : "No"}
      </div>

      <button className="sidebar-close" onClick={onClose}>Close</button>
    </div>
  );
}
