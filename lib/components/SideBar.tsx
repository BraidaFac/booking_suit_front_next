'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Listbox,
  ListboxSection,
  ListboxItem,
  Spinner,
} from '@nextui-org/react';
import { ListboxWrapper } from './ListboxWrapper';
import { Suit } from '../utils/Suit';
import React from 'react';
import { useSuitContext } from './SuitContext';
import Filter from './Filter';
import { useSideBarState } from '../utils/SideBarState';
import { API_BACKEND } from '../utils/constanst';

const SideBar = ({ isOpen }) => {
  const [suits, setSuits] = useState<Suit[]>([]);
  const [loading, setLoading] = useState(true);
  const { suit, setSuit } = useSuitContext();
  const [selectedValue, setSelectedValue] = useState();
  const { setIsOpen } = useSideBarState();

  //input filter

  const [query, setQuery] = useState('');
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

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BACKEND}/suit`);
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
        setIsOpen(false);
      }
    } else {
      if (suit) {
        setSelectedValue(suit.id);
      }
    }
  }, [selectedValue]);
  return (
    <div
      id="sidebar"
      className={`fixed top-32 h-full w-full bg-gray-200 rounded-lg  transform transition-transform  ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {loading ? (
        <div className="text-center">
          <Spinner color="danger"></Spinner>
        </div>
      ) : (
        <div className="h-full">
          <ListboxWrapper>
            <Filter handleChange={handleInputChange}></Filter>
            <h1 className="text-2xl text-center mt-3">Trajes</h1>
            <Listbox
              variant="flat"
              disallowEmptySelection
              selectionMode="single"
              onSelectionChange={(selected) => {
                setSelectedValue(selected.currentKey);
              }}
            >
              <ListboxSection>
                {suitsToShow.map((suit) => (
                  <ListboxItem
                    key={suit.id}
                    className="border-b-1 border-gray-500"
                    onClick={() => {
                      if (selectedValue === suit.id) {
                        setIsOpen(false);
                      }
                    }}
                  >
                    <span className="text-xl"> {suit.id}</span>
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
