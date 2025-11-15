// src/pages/MapView.jsx
import SearchBar from "../components/SearchBar";
import React, { useEffect, useRef, useState } from "react";
import tt from "@tomtom-international/web-sdk-maps";
import "@tomtom-international/web-sdk-maps/dist/maps.css"; // ensures CSS loads
import { getTrafficFlow } from "../services/api";

export default function MapView() {
  const mapElement = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const markersRef = useRef([]);

  const [status, setStatus] = useState("Map loading...");

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

      // Remove existing marker/popup
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }

      // Create a simple popup while loading
      const loadingPopup = new tt.Popup({ offset: 10 })
        .setLngLat([lng, lat])
        .setHTML("<div>Loading traffic data...</div>")
        .addTo(map);

      try {
        // call backend (which will call TomTom)
        const data = await getTrafficFlow(lat, lng);

        loadingPopup.remove();

        // Prepare display content
        const seg = data?.flowSegmentData;
        const html = seg
          ? `
            <div style="min-width:200px">
              <b>Traffic Flow</b><br/>
              <b>Current Speed:</b> ${seg.currentSpeed ?? "N/A"} km/h<br/>
              <b>Free Flow:</b> ${seg.freeFlowSpeed ?? "N/A"} km/h<br/>
              <b>Confidence:</b> ${seg.confidence ?? "N/A"}<br/>
              <b>Road Closure:</b> ${seg.roadClosure ? "Yes" : "No"}
            </div>`
          : "<div>No flow data returned</div>";

        popupRef.current = new tt.Popup({ offset: 10 })
          .setLngLat([lng, lat])
          .setHTML(html)
          .addTo(map);

        setStatus("Traffic data loaded.");
      } catch (err) {
        loadingPopup.remove();
        popupRef.current = new tt.Popup({ offset: 10 })
          .setLngLat([lng, lat])
          .setHTML(`<div style="color:red">Error fetching traffic data</div>`)
          .addTo(map);
        console.error("Error fetching traffic flow:", err);
        setStatus("Error fetching traffic data. See console for details.");
      }
    };

    map.on("click", handleMapClick);
    // cleanup
    return () => map.off("click", handleMapClick);
  }, []);

  const handleSelectPlace = (item) => {
    const pos = item.position; // lat & lon

    // Fly to location
    mapRef.current.flyTo({
      center: [pos.lon, pos.lat],
      zoom: 14,
      speed: 1
    });

    // Place marker
    const marker = new tt.Marker()
      .setLngLat([pos.lon, pos.lat])
      .addTo(mapRef.current);

    markersRef.current.push(marker);


    setStatus(`Centered map on: ${item.address.freeformAddress}`);
  };


  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = []; // reset array
    setStatus("All markers cleared.");
  };


return (
  <div style={{ padding: 12 }}>
    <h2>Live Traffic Map</h2>

    <div style={{ position: "relative" }}>
      <button
        onClick={clearMarkers}
        style={{
          padding: "8px 12px",
          marginBottom: "10px",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Clear Markers
      </button>

      <div
        id="map"
        ref={mapElement}
        style={{ width: "100%", height: "80vh" }}
      />

      {/* Search bar floating inside map */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 1000
        }}
      >
        <SearchBar onSelect={handleSelectPlace} />
      </div>
    </div>

    <p>{status}</p>
  </div>
);



}
