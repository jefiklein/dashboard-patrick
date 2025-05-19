import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, CalendarDays, Users, CheckCircle, Star } from "lucide-react";

const Dashboard = () => {
  // Placeholder data - you will replace this with actual data later
  const remainingBusinessDays = 15; // Example value
  const appointmentsMade = 50; // Example value
  const evaluationsGenerated = 30; // Example value
  const salesClosed = 20; // Example value
  const currentRevenue = 15000.50; // Example value
  const averageTicket = currentRevenue / (salesClosed || 1); // Example calculation

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
          <div className="text-2xl font-bold">{salesClosed}</div>
          <p className="text-xs text-muted-foreground">
            Total de vendas
          </p>
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
          <div className="text-2xl font-bold">R$ {currentRevenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Total de faturamento
          </p>
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
          <div className="text-2xl font-bold">R$ {averageTicket.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Faturamento / Vendas
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;