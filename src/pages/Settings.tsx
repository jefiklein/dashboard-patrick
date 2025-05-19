import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Settings = () => {
  // Aqui você pode adicionar state para os inputs e lógica para salvar
  const [baseValue, setBaseValue] = React.useState('');

  const handleSave = () => {
    // Lógica para salvar o valor base (ex: Local Storage, Context, API)
    console.log("Valor base salvo:", baseValue);
    // Implementar persistência aqui
  };

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

      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Dados Base para Cálculos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="baseValue">Valor Base (Exemplo)</Label>
            <Input
              id="baseValue"
              type="number"
              placeholder="Digite o valor base"
              value={baseValue}
              onChange={(e) => setBaseValue(e.target.value)}
            />
          </div>
          {/* Adicione mais campos de configuração aqui conforme necessário */}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave}>Salvar Configurações</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Settings;