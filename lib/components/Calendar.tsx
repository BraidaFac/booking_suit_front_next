'use client';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/solid/index.js';
import { formatMonth } from '../utils/date_formatter';
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isToday,
  parse,
  startOfToday,
  isBefore,
} from 'date-fns';
import { useState } from 'react';
import { bg } from 'date-fns/locale';

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ');
} /*  */

function isFuture(day: any) {
  return isBefore(startOfToday(), day);
}

export default function Calendar(props: any) {
  const today = startOfToday();
  const [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'));
  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());

  const days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  });
  function previousMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  }
  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  }

  return (
    <div className="">
      <div className="flex flex-col md:mx-auto md:w-1/2  text-center px-2 my-2">
        <h3 className="text-2xl px-2 text-white">Seleccione la fecha</h3>
      </div>
      <div className="mx-auto lg:w-4/5 bg-black">
        <div className="flex items-center text-center">
          <button
            type="button"
            onClick={previousMonth}
            className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400"
          >
            <ChevronLeftIcon className="w-8 h-8" aria-hidden="true" />
          </button>
          <h2 className="flex-auto font-semibold text-2xl text-white ">
            {formatMonth(firstDayCurrentMonth)}
          </h2>

          <button
            onClick={nextMonth}
            type="button"
            className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
          >
            <ChevronRightIcon className="w-8 h-8" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-7 mt-10 text-xs leading-6 text-center text-red-400 ">
          <div className="w-full ">D</div>
          <div className="w-full ">L</div>
          <div className="w-full ">M</div>
          <div className="w-full ">M</div>
          <div className="w-full ">J</div>
          <div className="w-full ">V</div>
          <div className="w-full ">S</div>
        </div>
        <div className="grid grid-cols-7 mt-2 text-sm gap-2 p-2">
          {days.map((day, dayIdx) => (
            <div
              key={day.toString()}
              className={classNames(
                dayIdx === 0 && colStartClasses[getDay(day)],
                'h-28 w-full border-solid border-2 border-white'
              )}
            >
              <button
                type="button"
                className={classNames(
                  'text-white',
                  isToday(day) && 'text-white',
                  !isToday(day) && 'text-gray-900',
                  isToday(day) && 'bg-primary',
                  !isToday(day) && 'bg-booking-card',
                  isToday(day) && 'font-semibold',
                  isFuture(day) && 'bg-gray-400',
                  isToday(day) && 'bg-red-300',
                  'w-full h-full flex justify-start p-2'
                )}
              >
                <time dateTime={format(day, 'yyyy-MM-dd')}>
                  {format(day, 'd')}
                </time>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

let colStartClasses = [
  '',
  'col-start-2',
  'col-start-3',
  'col-start-4',
  'col-start-5',
  'col-start-6',
  'col-start-7',
];
