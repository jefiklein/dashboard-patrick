import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'; // Importando ícones de navegação e loader
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { showSuccess, showError } from '@/utils/toast'; // Importar utilitários de toast

// Interface para a configuração mensal
interface MonthlyConfig {
  month: number; // 0 for January, 11 for December
  year: number;
  monthlyGoal: number;
  averageTicket: number;
  appointmentsMade: number;
  evaluationsGenerated: number;
  salesClosed: number;
}

// Interface para a estrutura de dados retornada pelo webhook de leitura
interface WebhookConfigData {
  id: number;
  created_at: string;
  updated_at: string;
  mes: number; // Mês retornado pelo webhook
  ano: number; // Ano retornado pelo webhook
  meta_mensal: number; // Meta Mensal retornado pelo webhook
  meta_ticket: number; // Ticket Médio retornado pelo webhook
  meta_agendamentos: number; // Agendamentos retornado pelo webhook
  meta_avaliacoes: number; // Avaliações retornado pelo webhook
  meta_quantidade_vendas: number; // Vendas Fechadas retornado pelo webhook
  id_clinica: number; // Exemplo de outro campo
}


// Função para gerar dados iniciais zerados para um ano específico
const generateInitialConfigForYear = (year: number): MonthlyConfig[] => {
  return Array.from({ length: 12 }).map((_, index) => ({
    month: index,
    year: year,
    monthlyGoal: 0,
    averageTicket: 0,
    appointmentsMade: 0,
    evaluationsGenerated: 0,
    salesClosed: 0,
  }));
};

const Settings = () => {
  // Estado para armazenar a configuração mensal do ano selecionado
  const [monthlyConfig, setMonthlyConfig] = React.useState<MonthlyConfig[]>([]);
  // Estado para o ano selecionado, inicializa com o ano atual
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());
  const [isLoading, setIsLoading] = React.useState(false);

  // URL do webhook para salvar as configurações
  const SAVE_WEBHOOK_URL = "https://north-clinic-n8n.hmvvay.easypanel.host/webhook/46d04edf-8fdc-4415-adf3-45482b9dd19c";
  // URL do webhook para carregar as configurações
  const LOAD_WEBHOOK_URL = "https://north-clinic-n8n.hmvvay.easypanel.host/webhook/b4833222-6fab-4f9f-9554-d14c82095a16";

  // Função para obter o nome do mês
  const getMonthName = (monthIndex: number) => {
    const date = new Date(new Date().getFullYear(), monthIndex, 1); // Ano no Date object não importa aqui, só o mês
    return format(date, 'MMMM', { locale: ptBR });
  };

  // Handler para mudança nos inputs da tabela
  const handleInputChange = (monthIndex: number, field: keyof Omit<MonthlyConfig, 'month' | 'year'>, value: string) => {
    setMonthlyConfig(prevConfig =>
      prevConfig.map((item, index) => {
        if (index === monthIndex) {
          // Se o valor for uma string vazia, trate como 0.
          // Caso contrário, tente converter para float, usando 0 se a conversão falhar.
          const numericValue = value === '' ? 0 : parseFloat(value) || 0;
          return { ...item, [field]: numericValue };
        }
        return item;
      })
    );
  };

  // Função para carregar a configuração para o ano selecionado
  const handleLoadConfiguration = async (year: number) => {
    setIsLoading(true);
    console.log(`Carregando configuração mensal para o ano: ${year}...`);

    if (!LOAD_WEBHOOK_URL) {
      console.error("URL do webhook de leitura não definida.");
      showError("Erro: URL do webhook de leitura não configurada.");
      setMonthlyConfig(generateInitialConfigForYear(year)); // Carrega dados iniciais se a URL não estiver definida
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${LOAD_WEBHOOK_URL}?year=${year}`);
      if (!response.ok) {
        const errorText = await response.text().catch(() => "Erro desconhecido");
        throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
      }
      // Espera um array de WebhookConfigData
      const data: WebhookConfigData[] = await response.json();
      console.log(`Dados brutos carregados do webhook para o ano ${year}:`, data);

      // Mapeia os dados recebidos para a estrutura MonthlyConfig
      const mappedData: MonthlyConfig[] = data.map(item => ({
        month: item.mes, // Mapeia 'mes' para 'month'
        year: item.ano,   // Mapeia 'ano' para 'year'
        monthlyGoal: item.meta_mensal, // Mapeia 'meta_mensal' para 'monthlyGoal'
        averageTicket: item.meta_ticket, // Mapeia 'meta_ticket' para 'averageTicket'
        appointmentsMade: item.meta_agendamentos, // Mapeia 'meta_agendamentos' para 'appointmentsMade'
        evaluationsGenerated: item.meta_avaliacoes, // Mapeia 'meta_avaliacoes' para 'evaluationsGenerated'
        salesClosed: item.meta_quantidade_vendas, // Mapeia 'meta_quantidade_vendas' para 'salesClosed'
      }));

      // Mescla os dados mapeados com a estrutura inicial para garantir todos os 12 meses
      const initialData = generateInitialConfigForYear(year);
      const mergedData = initialData.map(initialMonth => {
        const loadedMonth = mappedData.find(item => item.year === initialMonth.year && item.month === initialMonth.month);
        // Se encontrou dados para o mês, usa os dados carregados; caso contrário, usa os dados iniciais (zerados)
        return loadedMonth ? loadedMonth : initialMonth;
      });

      setMonthlyConfig(mergedData);
      console.log(`Configuração mesclada (mapeada) para o ano ${year}:`, mergedData);
      // showSuccess("Configuração carregada com sucesso!"); // Opcional: mostrar toast de sucesso no carregamento

    } catch (error: any) {
      console.error("Erro ao carregar configuração:", error);
      showError(`Erro ao carregar configuração: ${error.message}`);
      // Em caso de erro, ainda pode carregar os dados iniciais zerados
      setMonthlyConfig(generateInitialConfigForYear(year));
    } finally {
      setIsLoading(false);
    }
  };

  // Função para salvar a configuração para o ano selecionado
  const handleSaveConfiguration = async () => {
    setIsLoading(true);
    console.log(`Salvando configuração mensal para o ano: ${selectedYear}`, monthlyConfig);

    if (!SAVE_WEBHOOK_URL) {
      console.error("URL do webhook de salvamento não definida.");
      showError("Erro: URL do webhook de salvamento não configurada.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(SAVE_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Enviando o ano e o array completo de configurações mensais
        // Nota: Aqui estamos enviando os dados na estrutura MonthlyConfig.
        // O webhook de salvamento no n8n precisará mapear de volta para os nomes de coluna do banco de dados.
        body: JSON.stringify({
          year: selectedYear,
          config: monthlyConfig,
        }),
      });

      if (!response.ok) {
        // Tenta ler a mensagem de erro do corpo da resposta, se disponível
        const errorData = await response.text().catch(() => "Erro desconhecido");
        throw new Error(`Erro HTTP: ${response.status} - ${errorData}`);
      }

      // Opcional: processar a resposta do webhook se ele retornar algo útil
      // const result = await response.json();
      console.log(`Configuração salva com sucesso para o ano: ${selectedYear}.`);
      showSuccess("Configuração salva com sucesso!");

    } catch (error: any) {
      console.error("Erro ao salvar configuração:", error);
      showError(`Erro ao salvar configuração: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Efeito para carregar a configuração sempre que o ano selecionado mudar
  React.useEffect(() => {
    handleLoadConfiguration(selectedYear);
  }, [selectedYear]); // Dependência no selectedYear

  // Handlers para navegação de ano
  const handlePreviousYear = () => {
    setSelectedYear(prevYear => prevYear - 1);
  };

  const handleNextYear = () => {
    setSelectedYear(prevYear => prevYear + 1);
  };


  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
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
           {/* Navegação de Ano */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Button variant="outline" size="icon" onClick={handlePreviousYear} disabled={isLoading}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xl font-semibold">{selectedYear}</span>
            <Button variant="outline" size="icon" onClick={handleNextYear} disabled={isLoading}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Carregando...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Mês</TableHead>
                  <TableHead className="w-[150px]">Meta Mensal (R$)</TableHead>
                  <TableHead className="w-[150px]">Ticket Médio (R$)</TableHead>
                  <TableHead>Agendamentos</TableHead>
                  <TableHead>Avaliações</TableHead>
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
                        // Exibe o valor como string vazia se for 0, caso contrário exibe o número
                        value={config.monthlyGoal === 0 ? '' : config.monthlyGoal}
                        onChange={(e) => handleInputChange(index, 'monthlyGoal', e.target.value)}
                        className="w-full"
                        placeholder="Ex: 150000"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        // Exibe o valor como string vazia se for 0, caso contrário exibe o número
                        value={config.averageTicket === 0 ? '' : config.averageTicket}
                        onChange={(e) => handleInputChange(index, 'averageTicket', e.target.value)}
                        className="w-full"
                        placeholder="Ex: 2500"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                         // Exibe o valor como string vazia se for 0, caso contrário exibe o número
                        value={config.appointmentsMade === 0 ? '' : config.appointmentsMade}
                        onChange={(e) => handleInputChange(index, 'appointmentsMade', e.target.value)}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                         // Exibe o valor como string vazia se for 0, caso contrário exibe o número
                        value={config.evaluationsGenerated === 0 ? '' : config.evaluationsGenerated}
                        onChange={(e) => handleInputChange(index, 'evaluationsGenerated', e.target.value)}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                         // Exibe o valor como string vazia se for 0, caso contrário exibe o número
                        value={config.salesClosed === 0 ? '' : config.salesClosed}
                        onChange={(e) => handleInputChange(index, 'salesClosed', e.target.value)}
                        className="w-full"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
           <Button onClick={() => handleLoadConfiguration(selectedYear)} disabled={isLoading} variant="secondary">
             {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
             Carregar Configuração
           </Button>
           <Button onClick={handleSaveConfiguration} disabled={isLoading}>
             {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
             Salvar Configuração
           </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Settings;