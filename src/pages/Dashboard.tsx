import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, CalendarDays, Users, CheckCircle, Star, Loader2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Define a interface para os dados retornados pelo webhook
interface SalesData {
  count_id_north: number;
  sum_valor_venda: number;
}

// Função para buscar os dados do webhook
const fetchSalesData = async (): Promise<SalesData[]> => {
  const response = await fetch('https://north-clinic-n8n.hmvvay.easypanel.host/webhook/a1de671e-e201-489a-89db-fa12f96bd5c4');
  if (!response.ok) {
    throw new Error('Erro ao buscar dados do webhook');
  }
  return response.json();
};

const Dashboard = () => {
  // Placeholder data for metrics not fetched from the webhook yet
  const remainingBusinessDays = 15; // Example value
  const appointmentsMade = 50; // Example value
  const evaluationsGenerated = 30; // Example value

  // Use react-query to fetch sales data
  const { data, isLoading, isError, error } = useQuery<SalesData[], Error>({
    queryKey: ['salesData'], // Chave única para esta query
    queryFn: fetchSalesData, // Função que realiza a busca
    // staleTime: 1000 * 60 * 5, // Opcional: dados considerados "frescos" por 5 minutos
    // refetchOnWindowFocus: false, // Opcional: não refetch ao focar na janela
  });

  // Extrai os dados de vendas e faturamento, tratando o caso de dados vazios ou em carregamento/erro
  const salesClosed = data?.[0]?.count_id_north ?? 0;
  const currentRevenue = data?.[0]?.sum_valor_venda ?? 0;

  // Calcula o ticket médio
  const averageTicket = salesClosed > 0 ? currentRevenue / salesClosed : 0;

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <h1 className="col-span-full text-3xl font-bold mb-4">Dashboard de Vendas</h1>

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
          <div className="text-2xl font-bold">{appointmentsMade}</div>
          <p className="text-xs text-muted-foreground">
            Total de agendamentos
          </p>
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
          {isLoading && <div className="text-2xl font-bold flex items-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando...</div>}
          {isError && <div className="text-sm text-red-500 flex items-center"><AlertCircle className="mr-1 h-4 w-4" /> Erro: {error.message}</div>}
          {!isLoading && !isError && (
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
          {isLoading && <div className="text-2xl font-bold flex items-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando...</div>}
          {isError && <div className="text-sm text-red-500 flex items-center"><AlertCircle className="mr-1 h-4 w-4" /> Erro: {error.message}</div>}
          {!isLoading && !isError && (
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
           {isLoading && <div className="text-2xl font-bold flex items-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando...</div>}
           {isError && <div className="text-sm text-red-500 flex items-center"><AlertCircle className="mr-1 h-4 w-4" /> Erro ao calcular</div>}
           {!isLoading && !isError && (
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
  );
};

export default Dashboard;