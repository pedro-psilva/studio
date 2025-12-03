'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const teethPositions = [
    { tooth: 18, top: 185, left: 60 }, { tooth: 17, top: 150, left: 65 }, { tooth: 16, top: 115, left: 75 }, { tooth: 15, top: 85, left: 90 }, { tooth: 14, top: 60, left: 110 }, { tooth: 13, top: 42, left: 135 }, { tooth: 12, top: 28, left: 160 }, { tooth: 11, top: 20, left: 185 },
    { tooth: 21, top: 28, left: 215 }, { tooth: 22, top: 42, left: 240 }, { tooth: 23, top: 56, left: 265 }, { tooth: 24, top: 60, left: 290 }, { tooth: 25, top: 85, left: 310 }, { tooth: 26, top: 115, left: 325 }, { tooth: 27, top: 150, left: 335 }, { tooth: 28, top: 185, left: 340 },
    { tooth: 48, top: 585, left: 60 }, { tooth: 47, top: 550, left: 65 }, { tooth: 46, top: 515, left: 75 }, { tooth: 45, top: 485, left: 90 }, { tooth: 44, top: 460, left: 110 }, { tooth: 43, top: 440, left: 135 }, { tooth: 42, top: 425, left: 160 }, { tooth: 41, top: 415, left: 185 },
    { tooth: 31, top: 425, left: 215 }, { tooth: 32, top: 440, left: 240 }, { tooth: 33, top: 455, left: 265 }, { tooth: 34, top: 460, left: 290 }, { tooth: 35, top: 485, left: 310 }, { tooth: 36, top: 515, left: 325 }, { tooth: 37, top: 550, left: 335 }, { tooth: 38, top: 585, left: 340 },
];

const smileTeeth = [13, 12, 11, 21, 22, 23, 33, 32, 31, 41, 42, 43];

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
    setSelectedTeeth(smileTeeth.sort((a,b) => a-b));
  };

  const clearSelection = () => {
    setSelectedTeeth([]);
  };

  const handleNext = () => {
    onNext(selectedTeeth);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full p-4 h-full items-center md:items-start">
      {/* Visual Selector */}
      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <div 
          className="relative w-[420px] h-[620px]"
        >
          {teethPositions.map(({ tooth, top, left }) => (
            <ToothButton
              key={tooth}
              tooth={tooth}
              isSelected={selectedTeeth.includes(tooth)}
              onClick={toggleTooth}
              style={{ top: `${top}px`, left: `${left}px` }}
            />
          ))}
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
  style: React.CSSProperties;
}

function ToothButton({ tooth, isSelected, onClick, style }: ToothButtonProps) {
  return (
    <button
      type="button"
      style={style}
      className={cn(
        'absolute h-[38px] w-[38px] rounded-full border border-[#999] bg-[#E5E5E5] text-black text-xs font-semibold flex items-center justify-center transition-all duration-200',
        'hover:border-primary hover:scale-110',
        isSelected && 'bg-primary text-primary-foreground border-primary scale-110 shadow-lg'
      )}
      onClick={() => onClick(tooth)}
    >
      {tooth}
    </button>
  );
}
