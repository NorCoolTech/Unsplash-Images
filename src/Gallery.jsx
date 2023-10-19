import { useQuery } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useGlobalContext } from "./context";

const url = `https://api.unsplash.com/search/photos?client_id=${
  import.meta.env.VITE_API_KEY
}`;

const Gallery = () => {
  const { searchTerm } = useGlobalContext();
  const [randomMode, setRandomMode] = useState(false);
  const [randomCount, setRandomCount] = useState(0);

  const response = useQuery({
    queryKey: ["images", searchTerm, randomMode, randomCount],
    queryFn: async () => {
      let apiUrl = url;

      if (randomMode && randomCount === 0) {
        apiUrl = `https://api.unsplash.com/photos/random/?count=10&client_id=${
          import.meta.env.VITE_API_KEY
        }`;
      } else if (randomMode && randomCount > 0) {
        apiUrl = `https://api.unsplash.com/photos/random/?count=${randomCount}&client_id=${
          import.meta.env.VITE_API_KEY
        }`;
      } else if (searchTerm) {
        apiUrl = `https://api.unsplash.com/search/photos?client_id=${
          import.meta.env.VITE_API_KEY
        }&query=${searchTerm}`;
      }

      try {
        const result = await axios.get(apiUrl);
        return result.data;
      } catch (error) {
        if (error.response && error.response.status === 403) {
          console.error("Rate Limit Exceeded. Please try again later.");
        } else {
          console.error("Error fetching images:", error);
        }
        throw error;
      }
    },
    enabled: true, // Always enable the query
  });

  if (response.isLoading) {
    return (
      <section className="loading-container">
        <h4 className="loading"></h4>
      </section>
    );
  }

  if (response.isError) {
    return (
      <section className="image-container">
        <h4>Error: {response.error.message}</h4>
      </section>
    );
  }

  const results = Array.isArray(response.data)
    ? response.data
    : Array.isArray(response.data.results)
    ? response.data.results
    : [];

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
        <select
          name="randomImg"
          id="randomImg"
          value={randomCount}
          onChange={(e) => {
            setRandomCount(parseInt(e.target.value));
            setRandomMode(true);
          }}
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
          <option value="20">20</option>
          <option value="25">25</option>
          <option value="30">30</option>
        </select>
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
