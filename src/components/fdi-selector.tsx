'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const teethData = {
  upperLeft: [18, 17, 16, 15, 14, 13, 12, 11],
  upperRight: [21, 22, 23, 24, 25, 26, 27, 28],
  lowerLeft: [48, 47, 46, 45, 44, 43, 42, 41],
  lowerRight: [31, 32, 33, 34, 35, 36, 37, 38],
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
    setSelectedTeeth(smileTeeth);
  };

  const clearSelection = () => {
    setSelectedTeeth([]);
  };

  const handleNext = () => {
    onNext(selectedTeeth);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full p-4 h-full">
      {/* Visual Selector */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg mx-auto">
          {/* Upper Arch */}
          <div className="flex justify-center items-end gap-1 p-2">
            {teethData.upperLeft.map((tooth, i) => (
              <ToothButton
                key={tooth}
                tooth={tooth}
                isSelected={selectedTeeth.includes(tooth)}
                onClick={toggleTooth}
                className={cn({
                  'mb-1': i > 3,
                  'mb-3': i <= 3 && i > 1,
                  'mb-4': i <= 1,
                })}
              />
            ))}
             <div className="w-1 h-8 bg-border self-end mx-1" />
            {teethData.upperRight.map((tooth, i) => (
              <ToothButton
                key={tooth}
                tooth={tooth}
                isSelected={selectedTeeth.includes(tooth)}
                onClick={toggleTooth}
                className={cn({
                    'mb-4': i >= 6,
                    'mb-3': i < 6 && i >= 4,
                    'mb-1': i < 4,
                })}
              />
            ))}
          </div>

          {/* Lower Arch */}
          <div className="flex justify-center items-start gap-1 p-2 mt-4">
             {teethData.lowerLeft.map((tooth, i) => (
               <ToothButton
                key={tooth}
                tooth={tooth}
                isSelected={selectedTeeth.includes(tooth)}
                onClick={toggleTooth}
                className={cn({
                  'mt-1': i > 3,
                  'mt-3': i <= 3 && i > 1,
                  'mt-4': i <= 1,
                })}
              />
            ))}
             <div className="w-1 h-8 bg-border self-start mx-1" />
            {teethData.lowerRight.map((tooth, i) => (
              <ToothButton
                key={tooth}
                tooth={tooth}
                isSelected={selectedTeeth.includes(tooth)}
                onClick={toggleTooth}
                className={cn({
                    'mt-4': i >= 6,
                    'mt-3': i < 6 && i >= 4,
                    'mt-1': i < 4,
                })}
              />
            ))}
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
                Selecionar Sorriso (12)
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
        'h-9 w-9 p-0 rounded-md transition-all duration-200 ease-in-out hover:border-primary',
        'transform hover:scale-110',
        isSelected && 'shadow-lg shadow-primary/30',
        className
      )}
      onClick={() => onClick(tooth)}
    >
      {tooth}
    </Button>
  );
}
