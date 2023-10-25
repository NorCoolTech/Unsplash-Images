import React, { useState } from "react";
import Select from "react-select";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useGlobalContext } from "./context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";

const url = `https://api.unsplash.com/search/photos?client_id=${
  import.meta.env.VITE_API_KEY
}`;

const Gallery = () => {
  const { searchTerm, isDarkTheme } = useGlobalContext();
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
    enabled: true,
  });

  const options = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
    { value: "10", label: "10" },
    { value: "15", label: "15" },
    { value: "20", label: "20" },
    { value: "25", label: "25" },
    { value: "30", label: "30" },
  ];

 const customStyles = {
   control: (provided, state) => ({
     ...provided,
     border: "2px solid var(--primary-200)",
     borderRadius: "var(--borderRadius)",
     boxShadow: state.isFocused ? "0 0 0 0.2rem rgba(0,123,255,.25)" : "none",
     backgroundColor: state.isFocused
       ? isDarkTheme
         ? "var(--backgroundColor)"
         : "var(--grey-100)"
       : isDarkTheme
       ? "var(--grey-700)"
       : "var(--primary-50)",
     color: isDarkTheme ? "var(--grey-50)" : "var(--grey-900)",
     "&:hover": {
       border: "2px solid #adb5bd",
     },
     width: "150px",
     padding: "4px 12px",
   }),
   indicatorSeparator: (provided) => ({
     ...provided,
     display: "none",
   }),
   dropdownIndicator: (provided, state) => ({
     ...provided,
     color: state.isFocused ? "#007bff" : "#495057",
     "&:hover": {
       color: "#007bff",
     },
   }),
   option: (provided, state) => ({
     ...provided,
     color: state.isFocused
       ? isDarkTheme
         ? "var(--grey-50)"
         : "var(--grey-900)"
       : isDarkTheme
       ? "var(--grey-900)"
       : "var(--grey-900)",
     backgroundColor: state.isSelected
       ? isDarkTheme
         ? "var(--grey-50)"
         : "var(--grey-900)"
       : state.isFocused
       ? isDarkTheme
         ? "var(--grey-500)"
         : "var(--grey-500)"
       : "transparent",
     "&:hover": {
       backgroundColor: isDarkTheme ? "var(--grey-900)" : "var(--grey-300)",
       color: isDarkTheme ? "var(--grey-90)" : "var(--grey-900)",
     },
   }),
 };



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
        <Select
          options={options}
          value={options.find((option) => option.value === randomCount)}
          onChange={(selectedOption) => {
            setRandomCount(parseInt(selectedOption.value));
            setRandomMode(true);
          }}
          components={{
            IndicatorSeparator: () => null,
            DropdownIndicator: () => <FontAwesomeIcon icon={faArrowDown} />,
          }}
          styles={customStyles}
        />
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
