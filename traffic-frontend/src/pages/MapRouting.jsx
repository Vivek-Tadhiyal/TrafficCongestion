// src/pages/MapRouting.jsx
import React, { useEffect, useRef, useState } from "react";
import tt from "@tomtom-international/web-sdk-maps";
import "@tomtom-international/web-sdk-maps/dist/maps.css";

import { getRoute } from "../services/api";
import RouteSidebar from "../components/RouteSidebar";

import "../styles/MapView.css";
import "../styles/MapRouting.css";



const MapRouting = () => {
  const mapRef = useRef(null);
  const map = useRef(null);

  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);


  // The two text inputs (lat, lon)
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  // The route + sidebar info
  const [routeInfo, setRouteInfo] = useState(null);
  const [sidebarData, setSidebarData] = useState(null);

  // Initialize map ONCE
  useEffect(() => {
    map.current = tt.map({
      key: process.env.REACT_APP_TOMTOM_API_KEY,
      container: mapRef.current,
      center: [77.23, 28.61],
      zoom: 12,
    });
  }, []);

  // Draw polyline on map
  const drawRoute = (routeData) => {
    const coords = routeData.points.map(p => [p.longitude, p.latitude]);

    // remove existing route if any
    if (map.current.getLayer("route-line")) {
      map.current.removeLayer("route-line");
      map.current.removeSource("route-line");
    }

    map.current.addSource("route-line", {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: { type: "LineString", coordinates: coords },
      },
    });

    map.current.addLayer({
      id: "route-line",
      type: "line",
      source: "route-line",
      paint: {
        "line-color": "#4aa8ff",
        "line-width": 6,
      },
    });

    // Fit route inside map
    let bounds = new tt.LngLatBounds();
    coords.forEach(c => bounds.extend(c));
    map.current.fitBounds(bounds, { padding: 50 });
  };

  // Get route from backend
  const calculateRoute = async () => {
    if (!start || !end) {
      alert("Please enter valid start and end coordinates.");
      return;
    }

    const [startLat, startLon] = start.split(",");
    const [endLat, endLon] = end.split(",");

    const data = await getRoute(
      startLat.trim(),
      startLon.trim(),
      endLat.trim(),
      endLon.trim()
    );

    if (!data.points) {
      alert("No route returned.");
      return;
    }

    placeMarkers(startLat.trim(), startLon.trim(), endLat.trim(), endLon.trim());

    setRouteInfo(data);
    drawRoute(data);

    const summary = data.summary;

    setSidebarData({
    type: "route",

    // Distances / Times
    distance: (summary.lengthInMeters / 1000).toFixed(2),
    trafficTime: Math.round(summary.travelTimeInSeconds / 60),
    noTrafficTime: Math.round(summary.noTrafficTravelTimeInSeconds / 60),
    historicTime: Math.round(summary.historicTrafficTravelTimeInSeconds / 60),
    incidentTime: Math.round(summary.liveTrafficIncidentsTravelTimeInSeconds / 60),
    delay: Math.round(summary.trafficDelayInSeconds / 60),
    trafficLength: summary.trafficLengthInMeters,

    // Coordinates
    startLocation: start.trim(),
    endLocation: end.trim(),
    startLat, startLon, endLat, endLon,

    // Times
    departureTime: summary.departureTime,
    arrivalTime: summary.arrivalTime,
    });


  };

const clearRoute = () => {
  // Remove route polyline
  if (map.current.getLayer("route-line")) {
    map.current.removeLayer("route-line");
    map.current.removeSource("route-line");
  }

  // Remove markers
  if (startMarkerRef.current) {
    startMarkerRef.current.remove();
    startMarkerRef.current = null;
  }
  if (endMarkerRef.current) {
    endMarkerRef.current.remove();
    endMarkerRef.current = null;
  }

  // Reset sidebar
  setSidebarData(null);

  // Optionally reset inputs 
  setStart("");
  setEnd("");

  // Reset map view
  map.current.flyTo({
    center: [77.23, 28.61],  
    zoom: 11,
    speed: 1.2
  });
};


const placeMarkers = (startLat, startLon, endLat, endLon) => {
  // remove old markers if they exist
  if (startMarkerRef.current) {
    startMarkerRef.current.remove();
    startMarkerRef.current = null;
  }
  if (endMarkerRef.current) {
    endMarkerRef.current.remove();
    endMarkerRef.current = null;
  }

  // create blue start marker
  const startEl = document.createElement("div");
  startEl.style.background = "#2f80ff"; // blue
  startEl.style.width = "16px";
  startEl.style.height = "16px";
  startEl.style.borderRadius = "50%";
  startEl.style.border = "2px solid white";

  startMarkerRef.current = new tt.Marker({ element: startEl })
    .setLngLat([parseFloat(startLon), parseFloat(startLat)])
    .addTo(map.current);

  // create red end marker
  const endEl = document.createElement("div");
  endEl.style.background = "#ff4d4d"; // red
  endEl.style.width = "16px";
  endEl.style.height = "16px";
  endEl.style.borderRadius = "50%";
  endEl.style.border = "2px solid white";

  endMarkerRef.current = new tt.Marker({ element: endEl })
    .setLngLat([parseFloat(endLon), parseFloat(endLat)])
    .addTo(map.current);
};


  return (
    <div className="map-wrapper">
      <h2 className="map-heading">Smart Routing (Traffic Aware)</h2>

      {/* Row of inputs */}
      <div className="routing-input-wrapper">

        <div className="routing-input-box">
          <label>Start (lat, lon)</label>
          <input 
            value={start}
            onChange={(e) => setStart(e.target.value)}
            placeholder="28.6129, 77.2295"
          />
        </div>

        <div className="routing-input-box">
          <label>End (lat, lon)</label>
          <input 
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            placeholder="28.7041, 77.1025"
          />
        </div>

        <button className="route-btn" onClick={calculateRoute}>
          Find Route
        </button>

        <button className="route-btn" onClick={clearRoute}>
            Clear Route
        </button>

      </div>

      {/* Sidebar */}


      {/* Map */}
      <div className="map-container">
        <div ref={mapRef} className="map-box"></div>

        <RouteSidebar data={sidebarData} onClose={() => setSidebarData(null)} />
      </div>
    </div>
  );
};

export default MapRouting;
