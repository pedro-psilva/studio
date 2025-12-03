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
  top: string;
  left: string;
  rotate?: number;
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

// Reusable Tooth Button Component
function ToothButton({ tooth, isSelected, onClick, style }: ToothButtonProps) {
    return (
      <button
        type="button"
        style={style}
        className={cn(
          'absolute flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-sm font-light text-white shadow-[0_0_6px_rgba(0,0,0,0.2)] transition-all duration-200 active:scale-95',
          'hover:border-blue-500',
          isSelected && 'scale-105 border-blue-500 bg-blue-500 font-medium'
        )}
        onClick={() => onClick(tooth)}
      >
        {tooth}
      </button>
    );
  }

// --- Anatomical Arcade Components ---

const upperArcadePositions: ToothPosition[] = [
    // Quadrant 1 (Upper Right)
    { tooth: 18, top: '120px', left: '80px', rotate: -25 },
    { tooth: 17, top: '95px', left: '95px', rotate: -20 },
    { tooth: 16, top: '70px', left: '115px', rotate: -15 },
    { tooth: 15, top: '45px', left: '140px', rotate: -8 },
    { tooth: 14, top: '28px', left: '165px', rotate: -5 },
    { tooth: 13, top: '18px', left: '190px' },
    { tooth: 12, top: '12px', left: '218px' },
    { tooth: 11, top: '10px', left: '248px' },
    // Quadrant 2 (Upper Left)
    { tooth: 21, top: '10px', left: '282px' },
    { tooth: 22, top: '12px', left: '312px' },
    { tooth: 23, top: '18px', left: '340px' },
    { tooth: 24, top: '28px', left: '365px', rotate: 5 },
    { tooth: 25, top: '45px', left: '390px', rotate: 8 },
    { tooth: 26, top: '70px', left: '415px', rotate: 15 },
    { tooth: 27, top: '95px', left: '435px', rotate: 20 },
    { tooth: 28, top: '120px', left: '450px', rotate: 25 },
];

const lowerArcadePositions: ToothPosition[] = [
    // Quadrant 4 (Lower Right)
    { tooth: 48, top: '120px', left: '80px', rotate: 25 },
    { tooth: 47, top: '95px', left: '95px', rotate: 20 },
    { tooth: 46, top: '70px', left: '115px', rotate: 15 },
    { tooth: 45, top: '45px', left: '140px', rotate: 8 },
    { tooth: 44, top: '28px', left: '165px', rotate: 5 },
    { tooth: 43, top: '18px', left: '190px' },
    { tooth: 42, top: '12px', left: '218px' },
    { tooth: 41, top: '10px', left: '248px' },
    // Quadrant 3 (Lower Left)
    { tooth: 31, top: '10px', left: '282px' },
    { tooth: 32, top: '12px', left: '312px' },
    { tooth: 33, top: '18px', left: '340px' },
    { tooth: 34, top: '28px', left: '365px', rotate: -5 },
    { tooth: 35, top: '45px', left: '390px', rotate: -8 },
    { tooth: 36, top: '70px', left: '415px', rotate: -15 },
    { tooth: 37, top: '95px', left: '435px', rotate: -20 },
    { tooth: 38, top: '120px', left: '450px', rotate: -25 },
];

function Arcade({ positions, selectedTeeth, onToothClick }: ArcadaProps) {
    return (
        <div className="relative w-[540px] h-[260px] bg-transparent">
            {positions.map(({ tooth, top, left, rotate }) => (
                <ToothButton
                    key={tooth}
                    tooth={tooth}
                    isSelected={selectedTeeth.includes(tooth)}
                    onClick={onToothClick}
                    style={{ top, left, transform: `rotate(${rotate || 0}deg)` }}
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

const smileTeeth = [13, 12, 11, 21, 22, 23, 33, 32, 31, 41, 42, 43];

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
    <div className="flex animate-in fade-in flex-col md:flex-row gap-8 w-full p-4 h-full items-center md:items-start">
      {/* Visual Selector */}
      <div className="flex-1 flex flex-col items-center justify-center py-4 scale-90 md:scale-100">
        <Arcade 
            positions={upperArcadePositions}
            selectedTeeth={selectedTeeth}
            onToothClick={toggleTooth}
        />
        <div className="h-[55px]" /> 
        <Arcade 
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
