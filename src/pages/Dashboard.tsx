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

// Define as interfaces para os objetos dentro do array retornado pelo webhook de Agendamentos/Avaliações
interface AppointmentsData {
  total_agendamentos: number;
}

interface EvaluationsData {
  total_realizadas: number;
}

// Define o tipo esperado como um array contendo potencialmente esses objetos
type CombinedAppointmentsAndEvaluationsResponse = Array<AppointmentsData | EvaluationsData>;

// Interface para a estrutura de dados retornada pelo webhook de leitura de Configurações
interface WebhookConfigData {
  id: number;
  created_at: string;
  updated_at: string;
  mes: number; // Mês retornado pelo webhook (0-11)
  ano: number; // Ano retornado pelo webhook
  meta_mensal: number; // Meta Mensal retornado pelo webhook
  meta_ticket: number; // Ticket Médio retornado pelo webhook
  meta_agendamentos: number; // Agendamentos retornado pelo webhook
  meta_avaliacoes: number; // Avaliações retornado pelo webhook
  meta_quantidade_vendas: number; // Vendas Fechadas retornado pelo webhook
  id_clinica: number; // Exemplo de outro campo
}

// Interface para a configuração mensal (mapeada do webhook)
interface MonthlyConfig {
  month: number; // 0 for January, 11 for December
  year: number;
  monthlyGoal: number;
  averageTicket: number;
  appointmentsMade: number;
  evaluationsGenerated: number;
  salesClosed: number;
}


// Função para buscar os dados do webhook de Vendas, agora aceitando uma data
const fetchSalesData = async (date: Date): Promise<SalesData[]> => {
  const month = format(date, 'MM');
  const year = format(date, 'yyyy');
  const webhookUrl = `https://north-clinic-n8n.hmvvay.easypanel.host/webhook/a1de671e-e201-489a-89db-fa12f96bd5c4?month=${month}&year=${year}`;

  console.log("Fetching sales data for:", webhookUrl);

  const response = await fetch(webhookUrl);
  if (!response.ok) {
    throw new Error('Erro ao buscar dados de vendas do webhook');
  }
  return response.json();
};

// Função para buscar os dados do webhook de Agendamentos/Avaliações, agora aceitando uma data e esperando a estrutura de array
const fetchAppointmentsAndEvaluationsData = async (date: Date): Promise<CombinedAppointmentsAndEvaluationsResponse> => {
  const month = format(date, 'MM');
  const year = format(date, 'yyyy');
  const webhookUrl = `https://north-clinic-n8n.hmvvay.easypanel.host/webhook/815c3e0c-32c7-41ac-9a84-0b1125c4ed84?month=${month}&year=${year}`;

  console.log("Fetching appointments and evaluations data for:", webhookUrl);

  const response = await fetch(webhookUrl);
  if (!response.ok) {
    throw new Error('Erro ao buscar dados de agendamentos e avaliações do webhook');
  }
  const data: CombinedAppointmentsAndEvaluationsResponse = await response.json();
  console.log("Appointments and Evaluations Data received:", JSON.stringify(data, null, 2));
  return data;
};

// Função para buscar os dados de configuração mensal para um ano específico
const fetchMonthlyConfig = async (year: number): Promise<MonthlyConfig[]> => {
  const LOAD_WEBHOOK_URL = "https://north-clinic-n8n.hmvvay.easypanel.host/webhook/b4833222-6fab-4f9f-9554-d14c82095a16";
  if (!LOAD_WEBHOOK_URL) {
     console.error("URL do webhook de leitura de configuração não definida.");
     // Retorna um array vazio ou com dados zerados se a URL não estiver definida
     return Array.from({ length: 12 }).map((_, index) => ({
        month: index, year: year, monthlyGoal: 0, averageTicket: 0, appointmentsMade: 0, evaluationsGenerated: 0, salesClosed: 0
     }));
  }

  console.log(`Fetching monthly config for year: ${year} from ${LOAD_WEBHOOK_URL}?year=${year}`);

  try {
    const response = await fetch(`${LOAD_WEBHOOK_URL}?year=${year}`);
    if (!response.ok) {
      const errorText = await response.text().catch(() => "Erro desconhecido");
      throw new Error(`Erro HTTP ao buscar configuração: ${response.status} - ${errorText}`);
    }
    const data: WebhookConfigData[] = await response.json();
    console.log(`Raw config data received for year ${year}:`, data);

    // Mapeia os dados recebidos para a estrutura MonthlyConfig
    const mappedData: MonthlyConfig[] = data.map(item => ({
      month: item.mes, // Mapeia 'mes' para 'month' (0-11)
      year: item.ano,   // Mapeia 'ano' para 'year'
      monthlyGoal: item.meta_mensal, // Mapeia 'meta_mensal' para 'monthlyGoal'
      averageTicket: item.meta_ticket, // Mapeia 'meta_ticket' para 'averageTicket'
      appointmentsMade: item.meta_agendamentos, // Mapeia 'meta_agendamentos' para 'appointmentsMade'
      evaluationsGenerated: item.meta_avaliacoes, // Mapeia 'meta_avaliacoes' para 'evaluationsGenerated'
      salesClosed: item.meta_quantidade_vendas, // Mapeia 'meta_quantidade_vendas' para 'salesClosed'
    }));

    // Retorna os dados mapeados
    return mappedData;

  } catch (error) {
    console.error("Erro ao buscar configuração mensal:", error);
    // Em caso de erro, retorna dados zerados para o ano
    return Array.from({ length: 12 }).map((_, index) => ({
       month: index, year: year, monthlyGoal: 0, averageTicket: 0, appointmentsMade: 0, evaluationsGenerated: 0, salesClosed: 0
    }));
  }
};


// Função para calcular os dias úteis restantes (Segunda a Sábado) no mês da data selecionada
const calculateRemainingBusinessDays = (selectedDate: Date): number => {
  const today = startOfToday();
  const endOfSelectedMonth = endOfMonth(selectedDate);
  let businessDays = 0;
  let currentDate = today;

  // Se a data selecionada for um mês passado, o resultado é 0 dias restantes
  if (endOfSelectedMonth < today) {
      return 0;
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

  // Use react-query para buscar dados de agendamentos e avaliações, dependendo da data selecionada
  const {
    data: appointmentsAndEvaluationsData,
    isLoading: isLoadingAppointmentsAndEvaluations,
    isError: isErrorAppointmentsAndEvaluations,
    error: appointmentsAndEvaluationsError,
    refetch: refetchAppointmentsAndEvaluations,
    isFetching: isFetchingAppointmentsAndEvaluations
  } = useQuery<CombinedAppointmentsAndEvaluationsResponse, Error>({
    queryKey: ['appointmentsAndEvaluationsData', format(selectedDate, 'yyyy-MM')], // Query key inclui mês/ano
    queryFn: () => fetchAppointmentsAndEvaluationsData(selectedDate), // Passa a data selecionada
  });

  // Use react-query para buscar os dados de configuração mensal para o ano selecionado
  const {
    data: monthlyConfigData,
    isLoading: isLoadingConfig,
    isError: isErrorConfig,
    error: configError,
    refetch: refetchConfig,
    isFetching: isFetchingConfig
  } = useQuery<MonthlyConfig[], Error>({
    queryKey: ['monthlyConfig', selectedDate.getFullYear()], // Query key inclui apenas o ano
    queryFn: () => fetchMonthlyConfig(selectedDate.getFullYear()), // Passa o ano selecionado
  });


  // Adicionando logs para depuração
  console.log("Selected Date:", selectedDate);
  console.log("Sales Data:", salesData);
  console.log("Appointments and Evaluations Data:", appointmentsAndEvaluationsData);
  console.log("Monthly Config Data:", monthlyConfigData);


  // Extrai os dados de vendas e faturamento
  const salesClosed = salesData?.[0]?.count_id_north ?? 0;
  const currentRevenue = salesData?.[0]?.sum_valor_venda ?? 0;

  // Extrai os dados de agendamentos e avaliações da estrutura de array
  const appointmentsMade = (appointmentsAndEvaluationsData && appointmentsAndEvaluationsData.length > 0 && 'total_agendamentos' in appointmentsAndEvaluationsData[0])
    ? (appointmentsAndEvaluationsData[0] as AppointmentsData).total_agendamentos ?? 0
    : 0;

  const evaluationsGenerated = (appointmentsAndEvaluationsData && appointmentsAndEvaluationsData.length > 1 && 'total_realizadas' in appointmentsAndEvaluationsData[1])
    ? (appointmentsAndEvaluationsData[1] as EvaluationsData).total_realizadas ?? 0
    : 0;

  // Encontra a configuração para o mês selecionado
  const currentMonthConfig = monthlyConfigData?.find(config =>
    config.year === selectedDate.getFullYear() && config.month === selectedDate.getMonth()
  );

  // Calcula o ticket médio atual
  const averageTicket = salesClosed > 0 ? currentRevenue / salesClosed : 0;

  // Calcula os percentuais em relação às metas
  const revenueProgress = currentMonthConfig?.monthlyGoal > 0 ? (currentRevenue / currentMonthConfig.monthlyGoal) * 100 : null;
  const salesProgress = currentMonthConfig?.salesClosed > 0 ? (salesClosed / currentMonthConfig.salesClosed) * 100 : null;
  const appointmentsProgress = currentMonthConfig?.appointmentsMade > 0 ? (appointmentsMade / currentMonthConfig.appointmentsMade) * 100 : null;
  const evaluationsProgress = currentMonthConfig?.evaluationsGenerated > 0 ? (evaluationsGenerated / currentMonthConfig.evaluationsGenerated) * 100 : null;
  const averageTicketProgress = currentMonthConfig?.averageTicket > 0 ? (averageTicket / currentMonthConfig.averageTicket) * 100 : null;


  // Determina se qualquer uma das buscas está em andamento
  const isAnyFetching = isFetchingSales || isFetchingAppointmentsAndEvaluations || isFetchingConfig;

  // Handler para a mudança de mês no MonthNavigator
  const handleMonthChange = (newDate: Date) => {
    setSelectedDate(newDate);
    // react-query irá refetch automaticamente porque a queryKey mudou para salesData e appointmentsAndEvaluationsData
    // A queryKey para monthlyConfig só muda o ano, então refetchará se o ano mudar
  };

  // Handler para o botão Atualizar Dados
  const handleRefreshData = () => {
    refetchSales();
    refetchAppointmentsAndEvaluations();
    refetchConfig(); // Também refetch a configuração
  };


  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0"> {/* Ajuste para layout responsivo */}
        <h1 className="text-3xl font-bold">Dashboard de Vendas Madureira</h1>
        <div className="flex items-center space-x-4"> {/* Container para MonthNavigator e botões */}
          <MonthNavigator currentDate={selectedDate} onMonthChange={handleMonthChange} /> {/* Adiciona o MonthNavigator */}
          {/* Botão Atualizar Dados - Ícone no mobile, Ícone + Texto no desktop */}
          <Button onClick={handleRefreshData} disabled={isAnyFetching} size="icon" className="md:size-auto md:px-4 md:py-2">
            {isAnyFetching ? (
              <Loader2 className="h-4 w-4 md:mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 md:mr-2" />
            )}
            <span className="hidden md:inline">Atualizar Dados</span>
          </Button>
          {/* Botão Configurações - Ícone no mobile, Ícone + Texto no desktop */}
          <Link to="/settings">
            <Button variant="outline" size="icon" className="md:size-auto md:px-4 md:py-2">
              <SettingsIcon className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Configurações</span>
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
             {isLoadingAppointmentsAndEvaluations || isLoadingConfig ? (
               <div className="text-2xl font-bold flex items-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando...</div>
             ) : isErrorAppointmentsAndEvaluations || isErrorConfig ? (
               <div className="text-sm text-red-500 flex items-center"><AlertCircle className="mr-1 h-4 w-4" /> Erro ao carregar dados/meta</div>
             ) : (
              <>
                <div className="text-2xl font-bold">{appointmentsMade}</div>
                {currentMonthConfig && (
                  <p className="text-xs text-muted-foreground">
                    Meta: {currentMonthConfig.appointmentsMade} ({appointmentsProgress !== null ? `${appointmentsProgress.toFixed(0)}%` : 'N/A'} da meta)
                  </p>
                )}
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
             {isLoadingAppointmentsAndEvaluations || isLoadingConfig ? (
               <div className="text-2xl font-bold flex items-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando...</div>
             ) : isErrorAppointmentsAndEvaluations || isErrorConfig ? (
               <div className="text-sm text-red-500 flex items-center"><AlertCircle className="mr-1 h-4 w-4" /> Erro ao carregar dados/meta</div>
             ) : (
              <>
                <div className="text-2xl font-bold">{evaluationsGenerated}</div>
                {currentMonthConfig && (
                  <p className="text-xs text-muted-foreground">
                    Meta: {currentMonthConfig.evaluationsGenerated} ({evaluationsProgress !== null ? `${evaluationsProgress.toFixed(0)}%` : 'N/A'} da meta)
                  </p>
                )}
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
            {isLoadingSales || isLoadingConfig ? (
              <div className="text-2xl font-bold flex items-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando...</div>
            ) : isErrorSales || isErrorConfig ? (
              <div className="text-sm text-red-500 flex items-center"><AlertCircle className="mr-1 h-4 w-4" /> Erro ao carregar dados/meta</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{salesClosed}</div>
                {currentMonthConfig && (
                  <p className="text-xs text-muted-foreground">
                    Meta: {currentMonthConfig.salesClosed} ({salesProgress !== null ? `${salesProgress.toFixed(0)}%` : 'N/A'} da meta)
                  </p>
                )}
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
            {isLoadingSales || isLoadingConfig ? (
              <div className="text-2xl font-bold flex items-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando...</div>
            ) : isErrorSales || isErrorConfig ? (
              <div className="text-sm text-red-500 flex items-center"><AlertCircle className="mr-1 h-4 w-4" /> Erro ao carregar dados/meta</div>
            ) : (
              <>
                <div className="text-2xl font-bold">R$ {currentRevenue.toFixed(2)}</div>
                {currentMonthConfig && (
                  <p className="text-xs text-muted-foreground">
                    Meta: R$ {currentMonthConfig.monthlyGoal.toFixed(2)} ({revenueProgress !== null ? `${revenueProgress.toFixed(0)}%` : 'N/A'} da meta)
                  </p>
                )}
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
             {(isLoadingSales || isLoadingAppointmentsAndEvaluations || isLoadingConfig) ? (
               <div className="text-2xl font-bold flex items-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando...</div>
             ) : (isErrorSales || isErrorAppointmentsAndEvaluations || isErrorConfig) ? (
               <div className="text-sm text-red-500 flex items-center"><AlertCircle className="mr-1 h-4 w-4" /> Erro ao calcular</div>
             ) : (
              <>
                <div className="text-2xl font-bold">R$ {averageTicket.toFixed(2)}</div>
                {currentMonthConfig && (
                  <p className="text-xs text-muted-foreground">
                    Meta: R$ {currentMonthConfig.averageTicket.toFixed(2)} ({averageTicketProgress !== null ? `${averageTicketProgress.toFixed(0)}%` : 'N/A'} da meta)
                  </p>
                )}
              </>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;