'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Listbox,
  ListboxSection,
  ListboxItem,
  Spinner,
  Button,
} from '@nextui-org/react';
import { ListboxWrapper } from './ListboxWrapper';
import { Suit } from '../utils/Suit';
import React from 'react';
import { useSuitContext } from './SuitContext';
import Filter from './Filter';
import { useSideBarState } from '../utils/SideBarState';
import { API_BACKEND } from '../utils/constanst';

const SideBar = () => {
  const [suits, setSuits] = useState<Suit[]>([]);
  const [loading, setLoading] = useState(true);
  const { suit, setSuit } = useSuitContext();
  const [selectedValue, setSelectedValue] = useState();
  const { setIsOpen, isOpen } = useSideBarState();
  const [free_suits, setfree_suits] = useState<Suit[] | null>(null);
  const [selectedDate, setSelectedDate] = useState('');

  //input filter

  const [query, setQuery] = useState('');
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };
  const fetchFreeSuits = async (date: string) => {
    setLoading(true);
    const date_array = date.split('-');
    const date_string = `${date_array[2]}-${date_array[1]}-${date_array[0]}`;
    setSelectedDate(date_string);
    const res = await fetch(`${API_BACKEND}/suit/free/${date_string}`, {
      method: 'GET',
    });
    const data = await res.json();
    console.log(data);

    setfree_suits(data);
    setLoading(false);
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

  useEffect(() => {
    if (!isOpen) {
      setSelectedDate('');
      setfree_suits(null);
    }
  }, [isOpen]);
  return (
    <div
      id="sidebar"
      style={{ width: '98vw' }}
      className={`overflow-auto fixed top-32 h-full bg-gray-900 rounded-lg  transform transition-transform  ${
        isOpen ? 'translate-x-1' : '-translate-x-full'
      }`}
    >
      {loading ? (
        <div className="text-center">
          <Spinner color="danger"></Spinner>
        </div>
      ) : !free_suits ? (
        <div className="h-full">
          <ListboxWrapper>
            <h1 className="text-2xl text-center text-white ">Trajes</h1>
            <Filter
              handleChange={handleInputChange}
              onFetchSuit={fetchFreeSuits}
            ></Filter>
            <Listbox
              variant="flat"
              disallowEmptySelection
              selectionMode="single"
              onSelectionChange={(selected: any) => {
                setSelectedValue(selected.currentKey);
              }}
            >
              <ListboxSection>
                {suitsToShow.map((suit) => (
                  <ListboxItem
                    key={suit.id}
                    className="border-b-2 border-white text-white"
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
      ) : (
        <div className="h-full">
          <ListboxWrapper>
            <Button
              color="warning"
              className="ml-2"
              onClick={() => {
                setfree_suits(null);
                setSelectedDate('');
              }}
            >
              Volver
            </Button>
            <h1 className="text-2xl text-center text-white">
              Trajes fecha: {selectedDate}
            </h1>
            <Listbox
              variant="flat"
              disallowEmptySelection
              selectionMode="single"
              onSelectionChange={(selected: any) => {
                setSelectedValue(selected.currentKey);
              }}
            >
              <ListboxSection>
                {free_suits.length === 0 ? (
                  <ListboxItem key="no-suit text-white">
                    No hay trajes disponibles
                  </ListboxItem>
                ) : (
                  free_suits.map((suit) => (
                    <ListboxItem
                      key={suit.id}
                      className="border-b-2 border-white text-white"
                      onClick={() => {
                        if (selectedValue === suit.id) {
                          setIsOpen(false);
                        }
                      }}
                    >
                      <span className="text-xl"> {suit.id}</span>
                    </ListboxItem>
                  ))
                )}
              </ListboxSection>
            </Listbox>
          </ListboxWrapper>
        </div>
      )}
    </div>
  );
};

export default SideBar;
