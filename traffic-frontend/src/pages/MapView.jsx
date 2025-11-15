// src/pages/MapView.jsx
import "../styles/MapView.css";
import { getTrafficFlow } from "../services/api";
import SearchBar from "../components/SearchBar";
import React, { useEffect, useRef, useState } from "react";
import tt from "@tomtom-international/web-sdk-maps";
import "@tomtom-international/web-sdk-maps/dist/maps.css"; // ensures CSS loads
import TrafficSidebar from "../components/TrafficSidebar";

export default function MapView() {
  const mapElement = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const markersRef = useRef([]);

  const [status, setStatus] = useState("Map loading...");
  const [sidebarData, setSidebarData] = useState(null);
  const [sidebarLocation, setSidebarLocation] = useState("");


  useEffect(() => {
    if (!process.env.REACT_APP_TOMTOM_API_KEY) {
      setStatus("Missing REACT_APP_TOMTOM_API_KEY in .env");
      return;
    }

    // Initialize map
    mapRef.current = tt.map({
      key: process.env.REACT_APP_TOMTOM_API_KEY,
      container: mapElement.current,
      center: [77.23, 28.61], // lon, lat (TomTom expects [lng, lat])
      zoom: 12
    });

    // Add zoom control
    mapRef.current.addControl(new tt.NavigationControl());

    mapRef.current.on("load", () => {
      setStatus("Map loaded. Click anywhere to get traffic flow for that point.");
    });

    // Cleanup on unmount
    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, []);

  // click handler: place marker & fetch flow data from backend
useEffect(() => {
  const map = mapRef.current;
  if (!map) return;

  const handleMapClick = async (e) => {
    const { lng, lat } = e.lngLat;

    setStatus(`Fetching traffic flow for ${lat.toFixed(5)}, ${lng.toFixed(5)}...`);

    // CLEAR previous sidebar content
    setSidebarData(null);

    try {
      const data = await getTrafficFlow(lat, lng);

      // Update sidebar (SUCCESS)
      setSidebarData(data);
      setSidebarLocation(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);

      setStatus("Traffic data loaded.");
    } catch (err) {
      console.error("Error fetching traffic flow:", err);

      // Update sidebar (ERROR mode)
      setSidebarData({
        flowSegmentData: {
          currentSpeed: "N/A",
          freeFlowSpeed: "N/A",
          roadClosure: "N/A",
        }
      });

      setSidebarLocation("Error fetching traffic data");
      setStatus("Error fetching traffic data.");
    }
  };

  map.on("click", handleMapClick);

  return () => map.off("click", handleMapClick);
}, []);


const handleSelectPlace = async (item) => {
  const pos = item.position;
  const { lat, lon } = pos;

  // Move map to the selected location
  mapRef.current.flyTo({
    center: [lon, lat],
    zoom: 14,
    speed: 1
  });

  // Create marker
  const marker = new tt.Marker()
    .setLngLat([lon, lat])
    .addTo(mapRef.current);

  markersRef.current.push(marker);

  setStatus(`Fetching traffic for ${item.address.freeformAddress}...`);

  try {
    const data = await getTrafficFlow(lat, lon);

    // Update sidebar with traffic info
    setSidebarData(data);
    setSidebarLocation(item.address.freeformAddress);

    setStatus(`Traffic data loaded for ${item.address.freeformAddress}`);
  } catch (err) {
    console.error("Traffic fetch error:", err);

    // Show fallback error in sidebar
    setSidebarData({
      flowSegmentData: {
        currentSpeed: "N/A",
        freeFlowSpeed: "N/A",
        roadClosure: "N/A"
      }
    });

    setSidebarLocation("Error fetching traffic data");
    setStatus("Error fetching traffic data.");
  }
};




  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = []; // reset array
    setStatus("All markers cleared.");
  };


return (
  <div className="map-page">
    <h2 className="map-heading">Live Traffic Map</h2>

    <button className="clear-btn" onClick={clearMarkers}>
      Clear Markers
    </button>

    <div className="map-container">

      <div id="map" ref={mapElement} className="map-box" />

      <div className="searchbar-wrapper">
        <SearchBar onSelect={handleSelectPlace} />
      </div>

      <TrafficSidebar
        data={sidebarData}
        locationName={sidebarLocation}
        onClose={() => setSidebarData(null)}
      />

    </div>


    <p>{status}</p>
  </div>
);

}
