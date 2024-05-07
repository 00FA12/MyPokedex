import React, { useState, useEffect } from "react";
import "./FrontPage.css";

let pokeArray = [];
let imgsUrls = [];
let names = [];
let namesToShow = [];
let colors = [];
let pokedexNumbers = [];
let types = [];
let height = "";
let weight = "";

let nextPokeArray = [];
let nextUrls = [];
let nextNames = [];
let nextNamesToShow = [];
let nextColors = [];
let nextPokedexNumbers = [];

let ITEMS_PER_PAGE = 20;

export default function FrontPage() {
  const [extraInfo, setExtraInfo] = useState({
    types: [],
    height: "",
    weight: "",
  });

  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);

  let startIndex = currentPage * ITEMS_PER_PAGE;

  const updateExtraInfo = (types, height, weight) => {
    setExtraInfo({ types, height, weight });
  };

  const modifyItemsPerPage = () => {
    const prev = ITEMS_PER_PAGE;
    if (window.innerWidth > 2560) {
      ITEMS_PER_PAGE = 30;
    } else if (window.innerWidth <= 2560 && window.innerWidth > 1200) {
      ITEMS_PER_PAGE = 20;
    } else if (window.innerWidth <= 1200 && window.innerWidth > 500) {
      ITEMS_PER_PAGE = 10;
    } else {
      ITEMS_PER_PAGE = 5;
    }

    if (prev !== ITEMS_PER_PAGE) {
      const updatedData = imgsUrls
        .slice(startIndex, ITEMS_PER_PAGE)
        .map((imageSrc, i) => ({
          id: i,
          imageSrc,
          text: namesToShow[i],
          color: colors[i],
          numb: pokedexNumbers[i],
        }));
      setData(updatedData);
    }
  };

  useEffect(() => {
    modifyItemsPerPage();
    window.addEventListener("resize", modifyItemsPerPage);
  }, []);

  const RectangleComponent = ({ imageSrc, text, color, numb }) => {
    return (
      <div
        id="recComp"
        style={{ backgroundColor: color }}
        onClick={() => handleItemClick({ imageSrc, text, color, numb })}
      >
        <div id="imgBackground">
          <img id="pkmImg" src={imageSrc} alt="pkImg" />
        </div>
        <div style={{ textAlign: "center" }}>
          <div id="pokeText">
            <p style={{ margin: "0" }}>
              #{numb} {text}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const handleItemClick = async (item) => {
    if (selectedItem != null && item.imageSrc === selectedItem.imageSrc) {
      setSelectedItem(null);
    } else {
      await getExtraInfo(item.numb);
      setSelectedItem(item);
    }
  };

  const fetchData = async () => {
    try {
      document.getElementById('container').style.display = 'none';
      document.getElementById('loadingIndicator').style.display = 'inherit';
      setData([]);
      console.log(nextColors[ITEMS_PER_PAGE - 1]);
      if (currentPage === 0 || nextColors[ITEMS_PER_PAGE - 1] !== undefined) {
        await apiCall(startIndex, false);
        for (let j = 0; j < ITEMS_PER_PAGE; j++) {
          await fetchPkmnInfo(pokeArray[j], j, false);
          await getPkmnColor(pokedexNumbers[j], j, false);
        }

        const updatedData = imgsUrls.slice(0, ITEMS_PER_PAGE).map((imageSrc, i) => ({
            id: i,
            imageSrc,
            text: namesToShow[i],
            color: colors[i],
            numb: pokedexNumbers[i],
          }));
        await apiCall(startIndex + ITEMS_PER_PAGE, true);
        for (let i = 0; i < ITEMS_PER_PAGE; i++) {
          await fetchPkmnInfo(nextPokeArray[i], i, true);
          await getPkmnColor(nextNames[i], i, true);
        }
        setData(updatedData);
      } else {
        const next = nextUrls.map((imageSrc, i) => ({
          id: i,
          imageSrc,
          text: nextNamesToShow[i],
          color: nextColors[i],
          numb: nextPokedexNumbers[i],
        }));
        setData(next);

        await apiCall(startIndex + ITEMS_PER_PAGE, true);
        for (let i = 0; i < ITEMS_PER_PAGE; i++) {
          await fetchPkmnInfo(nextPokeArray[i], i, true);
          await getPkmnColor(nextNames[i], i, true);
        }
      }

      document.getElementById('loadingIndicator').style.display = 'none';
      document.getElementById('container').style.display = 'flex';
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const apiCall = async (startIndex, isNext) => {
    await fetch(
      "https://pokeapi.co/api/v2/pokemon/?limit=" +
        ITEMS_PER_PAGE +
        "&offset=" +
        startIndex
    )
      .then((rp) => {
        if (!rp.ok) {
          throw new Error("response was not okay");
        }
        return rp.json();
      })
      .then((pkmnList) => {
        if (!isNext) {
          for (let k = 0; k < ITEMS_PER_PAGE; k++) {
            pokeArray[k] = pkmnList.results[k].url;
          }
        } else {
          for (let k = 0; k < ITEMS_PER_PAGE; k++) {
            nextPokeArray[k] = pkmnList.results[k].url;
          }
        }
      })
      .catch((err) => {
        throw new Error(err);
      });
  };

  const fetchPkmnInfo = async (pkmnUrl, i, isNext) => {
    await fetch(pkmnUrl)
      .then((rp) => {
        if (!rp.ok) throw new Error("Response was not okay");
        return rp.json();
      })
      .then((pokemon) => {
        let capitalized =
          pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        if (!isNext) {
          imgsUrls[i] = pokemon.sprites.other.home.front_default;
          namesToShow[i] = capitalized;
          names[i] = pokemon.name;
          pokedexNumbers[i] = pokemon.id;
        } else {
          nextUrls[i] = pokemon.sprites.other.home.front_default;
          nextNames[i] = pokemon.name;
          nextNamesToShow[i] = capitalized;
          nextPokedexNumbers[i] = pokemon.id;
        }
      })
      .catch((err) => {
        throw new Error(err);
      });
  };

  const getPkmnColor = async (pkmnName, i, isNext) => {
    await fetch("https://pokeapi.co/api/v2/pokemon-species/" + pkmnName)
      .then((rp) => {
        if (!rp.ok) throw new Error("Response was not okay");
        return rp.json();
      })
      .then((pokemon) => {
        if (!isNext) {
          colors[i] = pokemon.color.name;
          //pokedexNumbers[i] = pokemon.id;
        } else {
          nextColors[i] = pokemon.color.name;
        }
      })
      .catch((err) => {
        throw new Error(err);
      });
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  const getExtraInfo = async (pkNumber) => {
    await fetch("https://pokeapi.co/api/v2/pokemon/" + pkNumber)
      .then((rp) => {
        if (!rp.ok) throw new Error("Response was not okay");
        return rp.json();
      })
      .then((pokemon) => {
        const primaryType = pokemon.types[0].type.name;
        const secondaryType = pokemon.types[1]?.type.name;
        types[0] = primaryType;
        if (secondaryType != null) {
          types[1] = secondaryType;
        }
        height = pokemon.height;
        weight = pokemon.weight;

        updateExtraInfo(types, height, weight);
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  return (
    <div>
      <img id="img" src="/MyPokedex/logos/PokeLogo.png" alt="Logo" />
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          class="button"
          onClick={handlePrevPage}
          disabled={currentPage === 0}
        >
          Previous Page
        </button>
        <button class="button" onClick={handleNextPage}>
          Next Page
        </button>
      </div>
      <div id="loadingIndicator">
        <img id="gif" src="/MyPokedex/giphy.gif" alt="trainGif" />
        <h2 id="waitingText">Pokemons are coming...</h2>
      </div>
      <div id="container" style={{ display: "flex", position: "relative" }}>
        <div id="grid" class="frontItems">
          {data.map((item) => (
            <RectangleComponent
              key={item.id}
              imageSrc={item.imageSrc}
              text={item.text}
              color={item.color}
              numb={item.numb}
            />
          ))}
        </div>
        <div
          id="banner"
          style={
            selectedItem
              ? { backgroundColor: selectedItem.color, marginRight: "30px" }
              : { width: "0%", marginRight: "0px", minWidth: "0px" }
          }
        >
          {selectedItem && (
            <>
              <div id="selImgBackground">
                <img id="selImg" src={selectedItem.imageSrc} alt="Logo" />
              </div>
              <div id="bannerInfo">
                <p>#{selectedItem.numb}</p>
                <p>Name: {selectedItem.text}</p>
                <p>
                  Types: {extraInfo.types[0]}
                  {extraInfo.types[1] && `, ${extraInfo.types[1]}`}
                </p>
                <p>Weight: {extraInfo.weight}</p>
                <p>Height: {extraInfo.height}</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          class="button"
          onClick={handlePrevPage}
          disabled={currentPage === 0}
        >
          Previous Page
        </button>
        <button class="button" onClick={handleNextPage}>
          Next Page
        </button>
      </div>
    </div>
  );
}
