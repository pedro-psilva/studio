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

  const getToothTransform = (arch: 'upper' | 'lower', tooth: number) => {
      const isUpper = arch === 'upper';
      const isLeft = tooth.toString().startsWith('1') || tooth.toString().startsWith('4');
      const position = isLeft ? (isUpper ? upperArch.left.indexOf(tooth) : lowerArch.left.indexOf(tooth)) : (isUpper ? upperArch.right.indexOf(tooth) : lowerArch.right.indexOf(tooth));

      const angleStep = 10;
      let angle = 0;
      lettranslateX = 0;
      let translateY = 0;

      if (isUpper) {
          angle = isLeft ? -40 + position * angleStep : 40 - position * angleStep;
          translateY = (8 - position) * 1.5;
          if (position > 4) translateY = (position) * 1.5;

      } else { // lower
          angle = isLeft ? 40 - position * angleStep : -40 + position * angleStep;
          translateY = (position) * 1.5;
           if (position > 4) translateY = (8 - position) * 1.5;
      }
      
      const adjustedTranslateY = isUpper ? Math.sin(Math.abs(angle) * Math.PI / 180) * 50 : Math.sin(Math.abs(angle) * Math.PI / 180) * -50;

      return {
          transform: `rotate(${angle}deg) translateY(${isUpper ? '-' : ''}9rem)`,
      };
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full p-4 h-full">
      {/* Visual Selector */}
      <div className="flex-1 flex flex-col items-center justify-center py-8">
          <div className="w-full max-w-lg mx-auto relative">
              {/* Upper Arch */}
              <div className="relative h-48 flex justify-center items-start">
                  <div className="absolute top-0 h-40 w-[26rem] bg-muted/30 rounded-t-[13rem] border-b border-border/50" />
                  <div className="absolute top-0 flex items-start">
                      {upperArch.left.concat(upperArch.right).map((tooth, i) => (
                           <div key={tooth} className="absolute origin-bottom-center h-40 w-10 text-center" style={getToothTransform('upper', tooth)}>
                            <ToothButton tooth={tooth} isSelected={selectedTeeth.includes(tooth)} onClick={toggleTooth} />
                           </div>
                      ))}
                  </div>
              </div>
              
              {/* Lower Arch */}
              <div className="relative h-48 flex justify-center items-end mt-4">
                  <div className="absolute bottom-0 h-40 w-[26rem] bg-muted/30 rounded-b-[13rem] border-t border-border/50" />
                  <div className="absolute bottom-0 flex items-end">
                      {lowerArch.left.concat(lowerArch.right).map((tooth, i) => (
                          <div key={tooth} className="absolute origin-top-center h-40 w-10 text-center" style={getToothTransform('lower', tooth)}>
                             <ToothButton tooth={tooth} isSelected={selectedTeeth.includes(tooth)} onClick={toggleTooth} />
                          </div>
                      ))}
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
