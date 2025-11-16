import "../styles/TrafficSidebar.css";

export default function TrafficSidebar({ data, locationName, onClose }) {
  if (!data) return null;

  // =============================
  // CASE 2: INCIDENT DATA
  // (user clicked a traffic incident marker)
  // This is detected by "incidentType" field
  // =============================
  console.log("they type is:",data.incidentType);
  if (data.incidentType) {
    return (
      <div className="sidebar">
        <div className="sidebar-title">Traffic Incident</div>

        <div className="sidebar-info">
          <span className="sidebar-label">Type:</span> {data.incidentType}
        </div>

        <div className="sidebar-info">
          <span className="sidebar-label">Description:</span>
          {data.properties?.description || "No description available"}
        </div>

        <div className="sidebar-info">
          <span className="sidebar-label">Severity:</span>
          {data.properties?.mag ?? "Not provided"}
        </div>

        <div className="sidebar-info">
          <span className="sidebar-label">Start:</span>
          {data.properties?.startTime ?? "Not provided"}
        </div>

        <div className="sidebar-info">
          <span className="sidebar-label">End:</span>
          {data.properties?.endTime ?? "Not available"}
        </div>

        <button className="sidebar-close" onClick={onClose}>Close</button>
      </div>
    );
  } 


  // =============================
  // CASE 1: TRAFFIC FLOW DATA
  // (user clicked map or selected a place)
  // =============================
  if (data.flowSegmentData) {
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

  // =============================
  // FALLBACK (nothing valid)
  // =============================
  return null;
}
