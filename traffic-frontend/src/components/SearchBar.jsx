import React, { useState, useRef } from "react";
import { autocompleteSearch } from "../services/searchService";

export default function SearchBar({ onSelect }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const debounceRef = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (value.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const results = await autocompleteSearch(value);
        setSuggestions(results);
      } catch (err) {
        console.error("Autocomplete error:", err);
      }
    }, 350); // wait 350ms before making the API call
  };

  return (
    <div style={{ position: "absolute", top: 20, left: 20, zIndex: 1000 }}>
      <input
        type="text"
        placeholder="Search for a place..."
        value={query}
        onChange={handleChange}
        style={{
          padding: "8px",
          width: "260px",
          borderRadius: "4px",
          border: "1px solid #ccc"
        }}
      />

      {suggestions.length > 0 && (
        <div
          style={{
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            marginTop: "4px",
            maxHeight: "200px",
            overflowY: "auto",
            width: "260px"
          }}
        >
          {suggestions.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setQuery(item.address?.freeformAddress || "");
                setSuggestions([]);
                onSelect(item);
              }}
              style={{
                padding: "8px",
                cursor: "pointer",
                borderBottom: "1px solid #eee"
              }}
            >
              {item.address?.freeformAddress}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
