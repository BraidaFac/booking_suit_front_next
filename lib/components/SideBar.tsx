"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { Listbox, ListboxSection, ListboxItem } from "@nextui-org/react";
import { ListboxWrapper } from "./ListboxWrapper";
import { Suit } from "../utils/Suit";
import React from "react";
import { useSuitContext } from "./SuitContext";
import Filter from "./Filter";

const SideBar = () => {
  const [suits, setSuits] = useState<Suit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [suit, setSuit] = useSuitContext();

  //input filter

  const [query, setQuery] = useState("");
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };
  const filterSuits = suits.filter(
    (suit) =>
      suit.id.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) !== -1
  );
  const filterData = (suits: Suit[], query: string) => {
    let filteredData = suits;
    if (query) {
      filteredData = filterSuits;
    }
    return filteredData;
  };
  const suitsToShow = filterData(suits, query);
  const selectedValue = React.useMemo(
    () => Array.from(selectedKeys).join(", "),
    [selectedKeys]
  );
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3001/suit");
      const data: Suit[] = await res.json();
      setSuits(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  }, []);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedValue) {
      const suit = suits.find((suit) => suit.id === selectedValue);
      if (suit) {
        setSuit(suit);
      }
    }
  }, [selectedValue]);
  return (
    <div className="col-span-3 bg-white mt-10">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <ListboxWrapper>
            <Filter handleChange={handleInputChange}></Filter>

            <Listbox
              variant="flat"
              disallowEmptySelection
              selectionMode="single"
              selectedKeys={selectedKeys}
              onSelectionChange={setSelectedKeys}
            >
              <ListboxSection title="Trajes">
                {suitsToShow.map((suit) => (
                  <ListboxItem key={suit.id}>
                    {suit.id} <span>{suit.color}</span>
                  </ListboxItem>
                ))}
              </ListboxSection>
            </Listbox>
          </ListboxWrapper>
        </div>
      )}
    </div>
  );
};

export default SideBar;
