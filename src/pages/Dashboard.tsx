import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, CalendarDays, Users, CheckCircle, Star, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Define a interface para os dados retornados pelo webhook de Vendas
interface SalesData {
  count_id_north: number;
  sum_valor_venda: number;
}

// Define a interface para os dados retornados pelo webhook de Agendamentos
interface AppointmentsData {
  count_id_agendamento: number; // Corrigido para usar o nome do campo correto
}

// Função para buscar os dados do webhook de Vendas
const fetchSalesData = async (): Promise<SalesData[]> => {
  const response = await fetch('https://north-clinic-n8n.hmvvay.easypanel.host/webhook/a1de671e-e201-489a-89db-fa12f96bd5c4');
  if (!response.ok) {
    throw new Error('Erro ao buscar dados de vendas do webhook');
  }
  return response.json();
};

// Função para buscar os dados do webhook de Agendamentos
const fetchAppointmentsData = async (): Promise<AppointmentsData[]> => {
  const response = await fetch('https://north-clinic-n8n.hmvvay.easypanel.host/webhook/815c3e0c-32c7-41ac-9a84-0b1125c4ed84');
  if (!response.ok) {
    throw new Error('Erro ao buscar dados de agendamentos do webhook');
  }
  return response.json();
};


const Dashboard = () => {
  // Placeholder data for metrics not fetched from webhooks yet
  const remainingBusinessDays = 15; // Example value
  const evaluationsGenerated = 30; // Example value

  // Use react-query to fetch sales data
  const {
    data: salesData,
    isLoading: isLoadingSales,
    isError: isErrorSales,
    error: salesError,
    refetch: refetchSales,
    isFetching: isFetchingSales
  } = useQuery<SalesData[], Error>({
    queryKey: ['salesData'],
    queryFn: fetchSalesData,
  });

  // Use react-query to fetch appointments data
  const {
    data: appointmentsData,
    isLoading: isLoadingAppointments,
    isError: isErrorAppointments,
    error: appointmentsError,
    refetch: refetchAppointments,
    isFetching: isFetchingAppointments
  } = useQuery<AppointmentsData[], Error>({
    queryKey: ['appointmentsData'],
    queryFn: fetchAppointmentsData,
  });


  // Extrai os dados de vendas e faturamento
  const salesClosed = salesData?.[0]?.count_id_north ?? 0;
  const currentRevenue = salesData?.[0]?.sum_valor_venda ?? 0;

  // Extrai os dados de agendamentos
  const appointmentsMade = appointmentsData?.[0]?.count_id_agendamento ?? 0; // Usando o campo correto

  // Calcula o ticket médio
  const averageTicket = salesClosed > 0 ? currentRevenue / salesClosed : 0;

  // Determina se qualquer uma das buscas está em andamento
  const isAnyFetching = isFetchingSales || isFetchingAppointments;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard de Vendas</h1>
        <Button onClick={() => { refetchSales(); refetchAppointments(); }} disabled={isAnyFetching}>
          {isAnyFetching ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Atualizar Dados
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card for Remaining Business Days */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Dias Úteis Restantes
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{remainingBusinessDays}</div>
            <p className="text-xs text-muted-foreground">
              Incluindo Sábados
            </p>
          </CardContent>
        </Card>

        {/* Card for Appointments Made */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Agendamentos Realizados
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingAppointments && <div className="text-2xl font-bold flex items-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando...</div>}
            isErrorAppointments && <div className="text-sm text-red-500 flex items-center"><AlertCircle className="mr-1 h-4 w-4" /> Erro: {appointmentsError?.message}</div>}
            {!isLoadingAppointments && !isErrorAppointments && (
              <>
                <div className="text-2xl font-bold">{appointmentsMade}</div>
                <p className="text-xs text-muted-foreground">
                  Total de agendamentos
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Card for Evaluations Generated */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avaliações Geradas
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{evaluationsGenerated}</div>
            <p className="text-xs text-muted-foreground">
              Total de avaliações
            </p>
          </CardContent>
        </Card>

        {/* Card for Sales Closed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vendas Fechadas
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
                  Total de vendas
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Card for Current Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Faturamento Atual
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
                  Total de faturamento
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Card for Average Ticket */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ticket Médio
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
                  Faturamento / Vendas
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