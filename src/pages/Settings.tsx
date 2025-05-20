import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interface para a configuração mensal
interface MonthlyConfig {
  month: number; // 0 for January, 11 for December
  year: number;
  monthlyGoal: number;
  averageTicket: number;
  appointmentsMade: number;
  evaluationsGenerated: number; // Adicionado campo para Avaliações Geradas
  salesClosed: number;
}

// Dados iniciais para a configuração mensal (todos zerados para o ano atual)
const initialConfig: MonthlyConfig[] = Array.from({ length: 12 }).map((_, index) => ({
  month: index,
  year: new Date().getFullYear(),
  monthlyGoal: 0,
  averageTicket: 0,
  appointmentsMade: 0,
  evaluationsGenerated: 0, // Inicializa o novo campo
  salesClosed: 0,
}));

const Settings = () => {
  // Estado para armazenar a configuração mensal
  const [monthlyConfig, setMonthlyConfig] = React.useState<MonthlyConfig[]>(initialConfig);
  const [isLoading, setIsLoading] = React.useState(false);

  // Função para obter o nome do mês
  const getMonthName = (monthIndex: number) => {
    const date = new Date(new Date().getFullYear(), monthIndex, 1);
    return format(date, 'MMMM', { locale: ptBR });
  };

  // Handler para mudança nos inputs da tabela
  const handleInputChange = (monthIndex: number, field: keyof Omit<MonthlyConfig, 'month' | 'year'>, value: string) => {
    setMonthlyConfig(prevConfig =>
      prevConfig.map((item, index) =>
        index === monthIndex
          ? { ...item, [field]: parseFloat(value) || 0 } // Converte para número, default 0 se inválido
          : item
      )
    );
  };

  // Função placeholder para carregar a configuração
  const handleLoadConfiguration = async () => {
    setIsLoading(true);
    console.log("Carregando configuração mensal...");
    // TODO: Implementar chamada ao webhook para carregar dados
    // Exemplo de como você usaria os dados carregados:
    // setMonthlyConfig(data);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simula carregamento
    console.log("Configuração carregada (placeholder).");
    setIsLoading(false);
  };

  // Função placeholder para salvar a configuração
  const handleSaveConfiguration = async () => {
    setIsLoading(true);
    console.log("Salvando configuração mensal:", monthlyConfig);
    // TODO: Implementar chamada ao webhook para salvar dados
    // Exemplo de como você enviaria os dados:
    // fetch(webhookUrl, { method: 'POST', body: JSON.stringify(monthlyConfig), headers: { 'Content-Type': 'application/json' } });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simula salvamento
    console.log("Configuração salva (placeholder).");
    setIsLoading(false);
  };

  React.useEffect(() => {
    // Opcional: Carregar configuração ao montar o componente
    // handleLoadConfiguration();
  }, []);


  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Dashboard
          </Button>
        </Link>
      </div>

      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle>Metas Mensais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Mês</TableHead>
                <TableHead>Meta Mensal (R$)</TableHead>
                <TableHead>Ticket Médio (R$)</TableHead>
                <TableHead>Agendamentos</TableHead>
                <TableHead>Avaliações</TableHead> {/* Nova coluna */}
                <TableHead>Vendas Fechadas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyConfig.map((config, index) => (
                <TableRow key={config.month}>
                  <TableCell className="font-medium capitalize">{getMonthName(config.month)}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={config.monthlyGoal}
                      onChange={(e) => handleInputChange(index, 'monthlyGoal', e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={config.averageTicket}
                      onChange={(e) => handleInputChange(index, 'averageTicket', e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={config.appointmentsMade}
                      onChange={(e) => handleInputChange(index, 'appointmentsMade', e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                   <TableCell> {/* Nova célula para Avaliações */}
                    <Input
                      type="number"
                      value={config.evaluationsGenerated}
                      onChange={(e) => handleInputChange(index, 'evaluationsGenerated', e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={config.salesClosed}
                      onChange={(e) => handleInputChange(index, 'salesClosed', e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
           <Button onClick={handleLoadConfiguration} disabled={isLoading} variant="secondary">
             {isLoading ? 'Carregando...' : 'Carregar Configuração'}
           </Button>
           <Button onClick={handleSaveConfiguration} disabled={isLoading}>
             {isLoading ? 'Salvando...' : 'Salvar Configuração'}
           </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Settings;