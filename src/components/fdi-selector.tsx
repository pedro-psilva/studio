'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChevronsRight } from 'lucide-react';

// --- Types and Data ---

interface ToothPosition {
  tooth: number;
  top: number;
  left: number;
}

interface ToothButtonProps {
  tooth: number;
  isSelected: boolean;
  onClick: (tooth: number) => void;
  style: React.CSSProperties;
}

interface ArcadaProps {
  positions: ToothPosition[];
  selectedTeeth: number[];
  onToothClick: (tooth: number) => void;
}

const upperArcadePositions: ToothPosition[] = [
  { tooth: 11, top: 15, left: 190 }, { tooth: 21, top: 15, left: 225 },
  { tooth: 12, top: 22, left: 165 }, { tooth: 22, top: 22, left: 250 },
  { tooth: 13, top: 40, left: 145 }, { tooth: 23, top: 40, left: 270 },
  { tooth: 14, top: 65, left: 130 }, { tooth: 24, top: 65, left: 285 },
  { tooth: 15, top: 95, left: 120 }, { tooth: 25, top: 95, left: 295 },
  { tooth: 16, top: 130, left: 110 }, { tooth: 26, top: 130, left: 305 },
  { tooth: 17, top: 165, left: 105 }, { tooth: 27, top: 165, left: 310 },
  { tooth: 18, top: 200, left: 105 }, { tooth: 28, top: 200, left: 310 },
];

const lowerArcadePositions: ToothPosition[] = [
    { tooth: 41, top: 210, left: 190 }, { tooth: 31, top: 210, left: 225 },
    { tooth: 42, top: 195, left: 165 }, { tooth: 32, top: 195, left: 250 },
    { tooth: 43, top: 175, left: 145 }, { tooth: 33, top: 175, left: 270 },
    { tooth: 44, top: 150, left: 130 }, { tooth: 34, top: 150, left: 285 },
    { tooth: 45, top: 120, left: 120 }, { tooth: 35, top: 120, left: 295 },
    { tooth: 46, top: 85, left: 110 },  { tooth: 36, top: 85, left: 305 },
    { tooth: 47, top: 50, left: 105 },  { tooth: 37, top: 50, left: 310 },
    { tooth: 48, top: 20, left: 105 },  { tooth: 38, top: 20, left: 310 },
];


const smileTeeth = [13, 12, 11, 21, 22, 23, 33, 32, 31, 41, 42, 43];

// --- Reusable Tooth Button Component ---

function ToothButton({ tooth, isSelected, onClick, style }: ToothButtonProps) {
  return (
    <button
      type="button"
      style={style}
      className={cn(
        'absolute h-[38px] w-[38px] rounded-full border border-border bg-card text-xs font-semibold flex items-center justify-center transition-all duration-200 text-card-foreground',
        'hover:border-primary hover:scale-110',
        isSelected && 'bg-primary text-primary-foreground border-primary scale-110 shadow-lg'
      )}
      onClick={() => onClick(tooth)}
    >
      {tooth}
    </button>
  );
}

// --- Anatomical Arcade Components ---

function ArcadaSuperiorFDI({ positions, selectedTeeth, onToothClick }: ArcadaProps) {
    return (
        <div className="relative w-[420px] h-[260px] bg-transparent">
            {positions.map(({ tooth, top, left }) => (
                <ToothButton
                    key={tooth}
                    tooth={tooth}
                    isSelected={selectedTeeth.includes(tooth)}
                    onClick={onToothClick}
                    style={{ top: `${top}px`, left: `${left}px` }}
                />
            ))}
        </div>
    );
}

function ArcadaInferiorFDI({ positions, selectedTeeth, onToothClick }: ArcadaProps) {
     return (
        <div className="relative w-[420px] h-[260px] bg-transparent">
             {positions.map(({ tooth, top, left }) => (
                <ToothButton
                    key={tooth}
                    tooth={tooth}
                    isSelected={selectedTeeth.includes(tooth)}
                    onClick={onToothClick}
                    style={{ top: `${top}px`, left: `${left}px` }}
                />
            ))}
        </div>
    );
}

// --- Main Selector Component ---

interface SeletorInterativoFDIProps {
  initialSelection?: number[];
  onNext: (selection: number[]) => void;
}

export function SeletorInterativoFDI({
  initialSelection = [],
  onNext,
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
    // Sort to ensure a consistent order
    setSelectedTeeth([...new Set([...selectedTeeth, ...smileTeeth])].sort((a,b) => a-b));
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
        <ArcadaSuperiorFDI 
            positions={upperArcadePositions}
            selectedTeeth={selectedTeeth}
            onToothClick={toggleTooth}
        />
        <div className="h-10" /> 
        <ArcadaInferiorFDI 
            positions={lowerArcadePositions}
            selectedTeeth={selectedTeeth}
            onToothClick={toggleTooth}
        />
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
                  <Badge key={tooth} variant="default" className="text-base bg-primary">
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
            <Button onClick={handleNext} className="flex-1">
                Avançar <ChevronsRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
      </div>
    </div>
  );
}
