'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Definindo os dentes em blocos para facilitar a curvatura
const upperArch = {
  left: [18, 17, 16, 15, 14, 13, 12, 11],
  right: [21, 22, 23, 24, 25, 26, 27, 28],
};

const lowerArch = {
  left: [48, 47, 46, 45, 44, 43, 42, 41],
  right: [31, 32, 33, 34, 35, 36, 37, 38],
};

const smileTeeth = [13, 12, 11, 21, 22, 23, 43, 42, 41, 31, 32, 33];

interface SeletorInterativoFDIProps {
  initialSelection?: number[];
  onNext: (selection: number[]) => void;
  onBack: () => void;
}

export function SeletorInterativoFDI({
  initialSelection = [],
  onNext,
  onBack,
}: SeletorInterativoFDIProps) {
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>(initialSelection);

  const toggleTooth = (tooth: number) => {
    setSelectedTeeth((prev) =>
      prev.includes(tooth)
        ? prev.filter((t) => t !== tooth)
        : [...prev, tooth].sort((a, b) => a - b)
    );
  };

  const selectSmile = () => {
    // Seleciona apenas os dentes do sorriso que existem nos dados da arcada
    const validSmileTeeth = smileTeeth.filter(t => 
        upperArch.left.includes(t) || upperArch.right.includes(t) ||
        lowerArch.left.includes(t) || lowerArch.right.includes(t)
    );
    setSelectedTeeth(validSmileTeeth);
  };

  const clearSelection = () => {
    setSelectedTeeth([]);
  };

  const handleNext = () => {
    onNext(selectedTeeth);
  };
  
  // Função para aplicar classes de margem para criar a curva
  const getToothClass = (arch: 'upper' | 'lower', tooth: number) => {
    const index = (arch === 'upper' ? upperArch.left.includes(tooth) ? upperArch.left.indexOf(tooth) : (15 - upperArch.right.indexOf(tooth)) : lowerArch.left.includes(tooth) ? lowerArch.left.indexOf(tooth) : (15 - lowerArch.right.indexOf(tooth)) );
    const marginClasses = [
        'mt-0', 'mt-1', 'mt-3', 'mt-4', 'mt-5', 'mt-6', 'mt-7', 'mt-8',
        'mt-8', 'mt-7', 'mt-6', 'mt-5', 'mt-4', 'mt-3', 'mt-1', 'mt-0'
    ];
    return arch === 'upper' ? marginClasses[index] : `-${marginClasses[index]}`;
  }


  return (
    <div className="flex flex-col md:flex-row gap-8 w-full p-4 h-full">
      {/* Visual Selector */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-xl mx-auto relative">
          
          {/* Upper Arch */}
          <div className="relative h-40 flex justify-center items-start">
             <div className="absolute top-0 h-28 w-full bg-muted/30 rounded-t-[100px] border-b border-border/50"></div>
             <div className="absolute top-0 flex items-start">
                {upperArch.left.map((tooth, i) => <ToothButton key={tooth} tooth={tooth} isSelected={selectedTeeth.includes(tooth)} onClick={toggleTooth} className={getToothClass('upper', tooth)} />)}
                <div className="w-1 h-10 bg-border/50 self-end mb-1 mx-1" />
                {upperArch.right.map((tooth, i) => <ToothButton key={tooth} tooth={tooth} isSelected={selectedTeeth.includes(tooth)} onClick={toggleTooth} className={getToothClass('upper', tooth)} />)}
             </div>
          </div>
          
          {/* Lower Arch */}
          <div className="relative h-40 flex justify-center items-end mt-4">
             <div className="absolute bottom-0 h-28 w-full bg-muted/30 rounded-b-[100px] border-t border-border/50"></div>
              <div className="absolute bottom-0 flex items-end">
                {lowerArch.left.map((tooth) => <ToothButton key={tooth} tooth={tooth} isSelected={selectedTeeth.includes(tooth)} onClick={toggleTooth} className={getToothClass('lower', tooth)} />)}
                <div className="w-1 h-10 bg-border/50 self-start mt-1 mx-1" />
                {lowerArch.right.map((tooth) => <ToothButton key={tooth} tooth={tooth} isSelected={selectedTeeth.includes(tooth)} onClick={toggleTooth} className={getToothClass('lower', tooth)} />)}
              </div>
          </div>

        </div>
      </div>

      {/* Side Panel */}
      <div className="w-full md:w-64 lg:w-72">
        <Card className="sticky top-0 bg-muted/50">
          <CardHeader>
            <CardTitle>Dentes Selecionados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[100px] rounded-md border border-dashed p-2 flex flex-wrap gap-2 justify-center items-start">
              {selectedTeeth.length > 0 ? (
                selectedTeeth.map((tooth) => (
                  <Badge key={tooth} variant="default" className="text-base">
                    {tooth}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground self-center">Nenhum dente selecionado</p>
              )}
            </div>
            <div className="mt-4 space-y-2">
              <Button onClick={selectSmile} variant="secondary" className="w-full">
                Selecionar Sorriso
              </Button>
              <Button onClick={clearSelection} variant="outline" className="w-full">
                Limpar Seleção
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={onBack} className="flex-1">
                Voltar
            </Button>
            <Button onClick={handleNext} className="flex-1">
                Avançar
            </Button>
        </div>
         <Button variant="ghost" className="w-full mt-2 text-muted-foreground">
            Salvar Rascunho
        </Button>
      </div>
    </div>
  );
}

interface ToothButtonProps {
  tooth: number;
  isSelected: boolean;
  onClick: (tooth: number) => void;
  className?: string;
}

function ToothButton({ tooth, isSelected, onClick, className }: ToothButtonProps) {
  return (
    <Button
      variant={isSelected ? 'default' : 'outline'}
      size="sm"
      className={cn(
        'h-9 w-9 p-0 rounded-md transition-all duration-200 ease-in-out z-10',
        'hover:border-primary hover:scale-110',
        isSelected && 'shadow-lg shadow-primary/30',
        className
      )}
      onClick={() => onClick(tooth)}
    >
      {tooth}
    </Button>
  );
}
