'use client';
import { Button, Input, NextUIProvider } from '@nextui-org/react';
import { ChangeEventHandler, useState } from 'react';

const Filter = ({
  handleChange,
  onFetchSuit,
}: {
  handleChange: ChangeEventHandler;
  onFetchSuit: (date: string) => void;
}) => {
  const [date, setDate] = useState('');
  return (
    <div className="w-full mt-1 flex flex-row items-center" id="filter_div">
      <Input
        size="lg"
        type="text"
        placeholder="Buscar"
        id="input_sidebar"
        onChange={handleChange}
        className=" w-2/3 mr-4"
      />

      <Input
        id="input_date_sidebar"
        type="date"
        className="w-10"
        size="lg"
        onChange={(e) => {
          setDate(e.target.value);
        }}
      ></Input>
      <a
        href=""
        className="ml-3 text-white"
        onClick={(e) => {
          e.preventDefault();
          if (date) {
            onFetchSuit(date);
            setDate('');
          }
        }}
      >
        Buscar
      </a>
    </div>
  );
};

export default Filter;
