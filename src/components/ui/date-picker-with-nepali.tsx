
"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import NepaliDate from "nepali-date-converter";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DatePickerWithNepaliProps {
  value: Date;
  onChange: (date: Date) => void;
}

const NepaliCalendar = ({ date, onDateSelect }: { date: NepaliDate, onDateSelect: (date: NepaliDate) => void}) => {
  const [displayDate, setDisplayDate] = useState(date);

  const monthData = useMemo(() => {
    const year = displayDate.getYear();
    const month = displayDate.getMonth();
    const monthDetails = NepaliDate.getMonthDays(year, month);
    const firstDayOfWeek = new NepaliDate(year, month, 1).getDay();
    
    const days = [];
    // Add padding for days from previous month
    for (let i = 0; i < firstDayOfWeek; i++) {
        days.push({ day: null, isCurrentMonth: false });
    }

    // Add days of the current month
    for (let i = 1; i <= monthDetails; i++) {
      days.push({ day: i, isCurrentMonth: true, year, month });
    }
    
    return {
        weekDays: NepaliDate.weekDays,
        days: days,
    };
  }, [displayDate]);

  const handlePrevMonth = () => {
    let newYear = displayDate.getYear();
    let newMonth = displayDate.getMonth() - 1;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    setDisplayDate(new NepaliDate(newYear, newMonth, 1));
  };

  const handleNextMonth = () => {
    let newYear = displayDate.getYear();
    let newMonth = displayDate.getMonth() + 1;
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setDisplayDate(new NepaliDate(newYear, newMonth, 1));
  };
  
  const handleYearChange = (yearStr: string) => {
    const year = parseInt(yearStr, 10);
    setDisplayDate(new NepaliDate(year, displayDate.getMonth(), 1));
  }

  const handleMonthChange = (monthStr: string) => {
    const month = parseInt(monthStr, 10);
     setDisplayDate(new NepaliDate(displayDate.getYear(), month, 1));
  }

  const years = Array.from({ length: 100 }, (_, i) => displayDate.getYear() - 50 + i);

  return (
    <div className="p-3">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex gap-2">
           <Select value={String(displayDate.getMonth())} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {NepaliDate.months.map((month, i) => (
                <SelectItem key={month} value={String(i)}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
           <Select value={String(displayDate.getYear())} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-sm">
        {monthData.weekDays.map(day => (
          <div key={day} className="font-semibold text-muted-foreground">{day[0]}</div>
        ))}
        {monthData.days.map((day, i) => (
           <Button
            key={i}
            variant="ghost"
            size="icon"
            onClick={() => day.isCurrentMonth && onDateSelect(new NepaliDate(day.year!, day.month!, day.day!))}
            className={cn(
                "h-9 w-9 p-0 font-normal",
                !day.isCurrentMonth && "text-muted-foreground opacity-50 pointer-events-none",
                day.isCurrentMonth && date.getYear() === day.year && date.getMonth() === day.month && date.getDate() === day.day && "bg-primary text-primary-foreground"
            )}
            disabled={!day.isCurrentMonth}
          >
            {day.day}
          </Button>
        ))}
      </div>
    </div>
  );
};


export function DatePickerWithNepali({
  value,
  onChange,
}: DatePickerWithNepaliProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  const handleADChange = (date: Date | undefined) => {
    if (date) {
      onChange(date);
      setPopoverOpen(false);
    }
  };

  const handleBSChange = (bsDate: NepaliDate) => {
    const adDate = bsDate.toJsDate();
    onChange(adDate);
    setPopoverOpen(false);
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Tabs defaultValue="ad" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ad">English (AD)</TabsTrigger>
            <TabsTrigger value="bs">Nepali (BS)</TabsTrigger>
          </TabsList>
          <TabsContent value="ad">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleADChange}
              initialFocus
            />
          </TabsContent>
          <TabsContent value="bs">
            <NepaliCalendar date={new NepaliDate(value)} onDateSelect={handleBSChange} />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
