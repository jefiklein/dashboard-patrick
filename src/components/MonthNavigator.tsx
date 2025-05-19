import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, subMonths, addMonths, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Importar locale para português

interface MonthNavigatorProps {
  currentDate: Date;
  onMonthChange: (newDate: Date) => void;
}

const MonthNavigator: React.FC<MonthNavigatorProps> = ({ currentDate, onMonthChange }) => {
  const formattedMonthYear = format(currentDate, "MMMM yyyy", { locale: ptBR });

  const handlePreviousMonth = () => {
    const previousMonth = subMonths(currentDate, 1);
    onMonthChange(startOfMonth(previousMonth)); // Navega para o início do mês anterior
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(currentDate, 1);
    onMonthChange(startOfMonth(nextMonth)); // Navega para o início do próximo mês
  };

  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-lg font-semibold capitalize">
        {formattedMonthYear}
      </span>
      <Button variant="outline" size="icon" onClick={handleNextMonth}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MonthNavigator;