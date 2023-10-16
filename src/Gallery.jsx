import { useQuery } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useGlobalContext } from "./context";

const url = `https://api.unsplash.com/photos?client_id=${
  import.meta.env.VITE_API_KEY
}`;

const Gallery = () => {
  const { searchTerm } = useGlobalContext();
  const [randomMode, setRandomMode] = useState(false);

  const response = useQuery({
    queryKey: ["images", searchTerm, randomMode],
    queryFn: async () => {
      let apiUrl = url;

      if (randomMode) {
        apiUrl += `&random?count=10`;
      } else if (searchTerm) {
        apiUrl += `&query=${searchTerm}`;
      }

      try {
        const result = await axios.get(apiUrl);
        return result.data;
      } catch (error) {
        console.error("Error fetching images:", error);
        throw error;
      }
    },
    enabled: true, // Always enable the query
  });

  if (response.isLoading) {
    return (
      <section className="image-container">
        <h4>Loading...</h4>
      </section>
    );
  }

  if (response.isError) {
    return (
      <section className="image-container">
        <h4>There was an error...</h4>
      </section>
    );
  }

  const results = Array.isArray(response.data) ? response.data : [];

  if (results.length < 1) {
    return (
      <section className="image-container">
        <h4>No results found...</h4>
      </section>
    );
  }

  return (
    <>
      <div className="gallery-filters">
        <button className="btn" onClick={() => setRandomMode(true)}>
          Get Random Images
        </button>
        <button className="btn" onClick={() => setRandomMode(false)}>
          Clear Random
        </button>
      </div>
      <section className="image-container">
        {results.map((item) => {
          const url = item?.urls?.regular;
          return (
            <img
              src={url}
              key={item.id}
              alt={item.alt_description}
              className="img"
            />
          );
        })}
      </section>
    </>
  );
};

export default Gallery;
