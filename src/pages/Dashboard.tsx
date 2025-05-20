import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, CalendarDays, Users, CheckCircle, Star, Loader2, AlertCircle, RefreshCw, Settings as SettingsIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { startOfToday, endOfMonth, getDay, addDays, isWeekend, format, startOfMonth, endOfDay } from 'date-fns';
import { Link } from 'react-router-dom';
import MonthNavigator from '@/components/MonthNavigator';
import { ptBR } from 'date-fns/locale'; // Importar locale para português

// Define a interface para os dados retornados pelo webhook de Vendas
interface SalesData {
  count_id_north: number;
  sum_valor_venda: number;
}

// Define a interface para a estrutura de dados retornada pelo webhook de Agendamentos
// Com base nos logs, ele retorna um objeto único com total_agendamentos
interface AppointmentsOnlyData {
  total_agendamentos: number;
}

// Função para buscar os dados do webhook de Vendas, agora aceitando uma data
const fetchSalesData = async (date: Date): Promise<SalesData[]> => {
  // Formata a data para incluir no webhook URL, se suportado
  // Exemplo: Adicionando query params para mês e ano. Ajuste conforme o webhook espera.
  const month = format(date, 'MM');
  const year = format(date, 'yyyy');
  const webhookUrl = `https://north-clinic-n8n.hmvvay.easypanel.host/webhook/a1de671e-e201-489a-89db-fa12f96bd5c4?month=${month}&year=${year}`;

  console.log("Fetching sales data for:", webhookUrl); // Log para depuração

  const response = await fetch(webhookUrl);
  if (!response.ok) {
    throw new Error('Erro ao buscar dados de vendas do webhook');
  }
  return response.json();
};

// Função para buscar os dados do webhook de Agendamentos, esperando a estrutura de objeto único
const fetchAppointmentsData = async (date: Date): Promise<AppointmentsOnlyData> => {
  const month = format(date, 'MM');
  const year = format(date, 'yyyy');
  // Este webhook retorna apenas dados de agendamentos
  const webhookUrl = `https://north-clinic-n8n.hmvvay.easypanel.host/webhook/815c3e0c-32c7-41ac-9a84-0b1125c4ed84?month=${month}&year=${year}`;

  console.log("Fetching appointments data for:", webhookUrl); // Log para depuração

  const response = await fetch(webhookUrl);
  if (!response.ok) {
    throw new Error('Erro ao buscar dados de agendamentos do webhook');
  }
  const data: AppointmentsOnlyData = await response.json();
  // Loga a resposta completa e formatada para depuração
  console.log("Appointments Data received:", JSON.stringify(data, null, 2));
  return data;
};


// Função para calcular os dias úteis restantes (Segunda a Sábado) no mês da data selecionada
const calculateRemainingBusinessDays = (selectedDate: Date): number => {
  const today = startOfToday();
  const endOfSelectedMonth = endOfMonth(selectedDate);
  let businessDays = 0;
  let currentDate = today;

  // Se a data selecionada for um mês futuro, calculamos os dias úteis do mês inteiro
  // Se for o mês atual, calculamos a partir de hoje até o fim do mês
  // Se for um mês passado, o resultado é 0 dias restantes
  if (endOfSelectedMonth < today) {
      return 0; // Mês passado, 0 dias restantes
  }

  // Se o mês selecionado for o mês atual, começamos a contagem a partir de hoje
  // Caso contrário (mês futuro), começamos a contagem a partir do início do mês selecionado
  currentDate = startOfMonth(selectedDate) > today ? startOfMonth(selectedDate) : today;


  while (currentDate <= endOfSelectedMonth) {
    const dayOfWeek = getDay(currentDate); // 0 = Domingo, 6 = Sábado
    // Considera Segunda (1) a Sábado (6) como dias úteis
    if (dayOfWeek !== 0) { // Exclui Domingo
      businessDays++;
    }
    currentDate = addDays(currentDate, 1);
  }
  return businessDays;
};


const Dashboard = () => {
  // Estado para a data selecionada no MonthNavigator, inicializa com o início do mês atual
  const [selectedDate, setSelectedDate] = React.useState<Date>(startOfMonth(new Date()));

  // Calcula os dias úteis restantes dinamicamente com base na data selecionada
  const remainingBusinessDays = calculateRemainingBusinessDays(selectedDate);

  // Use react-query para buscar dados de vendas, dependendo da data selecionada
  const {
    data: salesData,
    isLoading: isLoadingSales,
    isError: isErrorSales,
    error: salesError,
    refetch: refetchSales,
    isFetching: isFetchingSales
  } = useQuery<SalesData[], Error>({
    queryKey: ['salesData', format(selectedDate, 'yyyy-MM')], // Query key inclui mês/ano para refetch automático
    queryFn: () => fetchSalesData(selectedDate), // Passa a data selecionada para a função de busca
  });

  // Use react-query para buscar dados de agendamentos, dependendo da data selecionada
  const {
    data: appointmentsData, // Renomeado para appointmentsData
    isLoading: isLoadingAppointments, // Renomeado
    isError: isErrorAppointments, // Renomeado
    error: appointmentsError, // Renomeado
    refetch: refetchAppointments, // Renomeado
    isFetching: isFetchingAppointments // Renomeado
  } = useQuery<AppointmentsOnlyData, Error>({ // Usando a nova interface
    queryKey: ['appointmentsData', format(selectedDate, 'yyyy-MM')], // Query key inclui mês/ano
    queryFn: () => fetchAppointmentsData(selectedDate), // Passa a data selecionada
  });

  // Adicionando logs para depuração
  console.log("Selected Date:", selectedDate);
  // O log da resposta completa agora está dentro de fetchAppointmentsData
  console.log("Is Loading Appointments:", isLoadingAppointments);
  console.log("Is Error Appointments:", isErrorAppointments);
  console.log("Appointments Error:", appointmentsError);


  // Extrai os dados de vendas e faturamento
  const salesClosed = salesData?.[0]?.count_id_north ?? 0;
  const currentRevenue = salesData?.[0]?.sum_valor_venda ?? 0;

  // Extrai os dados de agendamentos do objeto retornado
  const appointmentsMade = appointmentsData?.total_agendamentos ?? 0;
  // O webhook de agendamentos não retorna dados de avaliações, então usamos 0 por enquanto
  const evaluationsGenerated = 0;


  console.log("Appointments Made (extracted):", appointmentsMade);
  console.log("Evaluations Generated (extracted):", evaluationsGenerated);


  // Calcula o ticket médio
  const averageTicket = salesClosed > 0 ? currentRevenue / salesClosed : 0;

  // Determina se qualquer uma das buscas está em andamento
  const isAnyFetching = isFetchingSales || isFetchingAppointments; // Atualizado para isFetchingAppointments

  // Handler para a mudança de mês no MonthNavigator
  const handleMonthChange = (newDate: Date) => {
    setSelectedDate(newDate);
    // react-query irá refetch automaticamente porque a queryKey mudou
  };

  // Handler para o botão Atualizar Dados
  const handleRefreshData = () => {
    refetchSales();
    refetchAppointments(); // Atualizado para refetchAppointments
  };


  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0"> {/* Ajuste para layout responsivo */}
        <h1 className="text-3xl font-bold">Dashboard de Vendas Madureira</h1>
        <div className="flex items-center space-x-4"> {/* Container para MonthNavigator e botões */}
          <MonthNavigator currentDate={selectedDate} onMonthChange={handleMonthChange} /> {/* Adiciona o MonthNavigator */}
          <Button onClick={handleRefreshData} disabled={isAnyFetching}>
            {isAnyFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Atualizar Dados
          </Button>
          <Link to="/settings">
            <Button variant="outline">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Configurações
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card for Remaining Business Days */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Dias Úteis Restantes ({format(selectedDate, 'MM/yyyy')}) {/* Mostra o mês/ano no título */}
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{remainingBusinessDays}</div>
            <p className="text-xs text-muted-foreground">
              Contando de Segunda a Sábado
            </p>
          </CardContent>
        </Card>

        {/* Card for Appointments Made */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Agendamentos Realizados ({format(selectedDate, 'MM/yyyy')}) {/* Mostra o mês/ano no título */}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingAppointments && <div className="text-2xl font-bold flex items-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando...</div>}
            {isErrorAppointments && <div className="text-sm text-red-500 flex items-center"><AlertCircle className="mr-1 h-4 w-4" /> Erro: {appointmentsError?.message}</div>}
            {!isLoadingAppointments && !isErrorAppointments && (
              <>
                <div className="text-2xl font-bold">{appointmentsMade}</div>
                <p className="text-xs text-muted-foreground">
                  Total de agendamentos no mês
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Card for Evaluations Generated */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avaliações Geradas ({format(selectedDate, 'MM/yyyy')}) {/* Mostra o mês/ano no título */}
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {/* Este webhook não retorna dados de avaliações, exibindo 0 */}
             {isLoadingAppointments && <div className="text-2xl font-bold flex items-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando...</div>}
             {isErrorAppointments && <div className="text-sm text-red-500 flex items-center"><AlertCircle className="mr-1 h-4 w-4" /> Erro ao carregar agendamentos</div>}
             {!isLoadingAppointments && !isErrorAppointments && (
              <>
                <div className="text-2xl font-bold">{evaluationsGenerated}</div> {/* Atualmente 0 */}
                <p className="text-xs text-muted-foreground">
                  Total de avaliações no mês (dados não disponíveis neste webhook)
                </p>
              </>
             )}
          </CardContent>
        </Card>

        {/* Card for Sales Closed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vendas Fechadas ({format(selectedDate, 'MM/yyyy')}) {/* Mostra o mês/ano no título */}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSales && <div className="text-2xl font-bold flex items-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando...</div>}
            {isErrorSales && <div className="text-sm text-red-500 flex items-center"><AlertCircle className="mr-1 h-4 w-4" /> Erro: {salesError?.message}</div>}
            {!isLoadingSales && !isErrorSales && (
              <>
                <div className="text-2xl font-bold">{salesClosed}</div>
                <p className="text-xs text-muted-foreground">
                  Total de vendas no mês
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Card for Current Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Faturamento Atual ({format(selectedDate, 'MM/yyyy')}) {/* Mostra o mês/ano no título */}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSales && <div className="text-2xl font-bold flex items-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando...</div>}
            {isErrorSales && <div className="text-sm text-red-500 flex items-center"><AlertCircle className="mr-1 h-4 w-4" /> Erro: {salesError?.message}</div>}
            {!isLoadingSales && !isErrorSales && (
              <>
                <div className="text-2xl font-bold">R$ {currentRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Total de faturamento no mês
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Card for Average Ticket */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ticket Médio ({format(selectedDate, 'MM/yyyy')}) {/* Mostra o mês/ano no título */}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {(isLoadingSales || isLoadingAppointments) && <div className="text-2xl font-bold flex items-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando...</div>}
             {(isErrorSales || isErrorAppointments) && <div className="text-sm text-red-500 flex items-center"><AlertCircle className="mr-1 h-4 w-4" /> Erro ao calcular</div>}
             {!(isLoadingSales || isLoadingAppointments) && !(isErrorSales || isErrorAppointments) && (
              <>
                <div className="text-2xl font-bold">R$ {averageTicket.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Faturamento / Vendas no mês
                </p>
              </>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;