import { Palette, Sun, Moon, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ThemeColorPickerProps {
  primaryColor: string;
  setPrimaryColor: (value: string) => void;
  backgroundColor: string;
  setBackgroundColor: (value: string) => void;
  onSave: () => void;
}

// Preset primary colors (orange variants and other popular options)
const PRIMARY_PRESETS = [
  { color: '#f97316', name: '오렌지' },      // Orange-500 (default)
  { color: '#ea580c', name: '다크 오렌지' },  // Orange-600
  { color: '#f59e0b', name: '앰버' },         // Amber-500
  { color: '#eab308', name: '옐로우' },       // Yellow-500
  { color: '#ef4444', name: '레드' },         // Red-500
  { color: '#ec4899', name: '핑크' },         // Pink-500
  { color: '#8b5cf6', name: '바이올렛' },     // Violet-500
  { color: '#3b82f6', name: '블루' },         // Blue-500
  { color: '#10b981', name: '에메랄드' },     // Emerald-500
  { color: '#14b8a6', name: '틸' },           // Teal-500
];

// Preset background colors
const BACKGROUND_PRESETS = [
  { color: '#ffffff', name: '화이트' },       // Pure white
  { color: '#fafafa', name: '스노우' },       // Gray-50
  { color: '#f5f5f5', name: '라이트 그레이' }, // Gray-100
  { color: '#f0f0f0', name: '실버' },         // Custom light
  { color: '#0a0a0a', name: '다크' },         // Near black
  { color: '#000000', name: '블랙' },         // Pure black
];

export const ThemeColorPicker = ({
  primaryColor,
  setPrimaryColor,
  backgroundColor,
  setBackgroundColor,
  onSave,
}: ThemeColorPickerProps) => {
  const resetToDefaults = () => {
    setPrimaryColor('#f97316');
    setBackgroundColor('#ffffff');
  };

  return (
    <Card className="bg-white border-2 border-purple-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Palette className="w-5 h-5 text-purple-500" />
          테마 색상 설정
        </CardTitle>
        <CardDescription className="text-gray-600">
          사이트 전체에 적용될 메인 색상과 배경 색상을 선택합니다 (실시간 반영)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Color Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-orange-500" />
            <Label className="text-sm font-medium text-gray-900">메인 테마 색상 (Primary)</Label>
          </div>
          <p className="text-xs text-gray-500">
            버튼, 강조 텍스트, 타이머 숫자 등에 적용됩니다
          </p>
          
          {/* Color Presets */}
          <div className="flex flex-wrap gap-2">
            {PRIMARY_PRESETS.map((preset) => (
              <button
                key={preset.color}
                onClick={() => setPrimaryColor(preset.color)}
                className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                  primaryColor === preset.color 
                    ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-400' 
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: preset.color }}
                title={preset.name}
              />
            ))}
          </div>
          
          {/* Custom Color Input */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                title="커스텀 색상 선택"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#f97316"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-mono text-sm uppercase"
              />
            </div>
          </div>
        </div>

        {/* Background Color Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-gray-500" />
            <Label className="text-sm font-medium text-gray-900">배경 색상 (Background)</Label>
          </div>
          <p className="text-xs text-gray-500">
            사이트 전체 배경에 적용됩니다
          </p>
          
          {/* Background Presets */}
          <div className="flex flex-wrap gap-2">
            {BACKGROUND_PRESETS.map((preset) => (
              <button
                key={preset.color}
                onClick={() => setBackgroundColor(preset.color)}
                className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                  backgroundColor === preset.color 
                    ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-400' 
                    : 'border-gray-300'
                } ${preset.color === '#ffffff' || preset.color === '#fafafa' ? 'shadow-sm' : ''}`}
                style={{ backgroundColor: preset.color }}
                title={preset.name}
              />
            ))}
          </div>
          
          {/* Custom Background Input */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                title="커스텀 배경 선택"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="#ffffff"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-mono text-sm uppercase"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 rounded-lg border border-gray-200" style={{ backgroundColor }}>
          <div className="flex items-center gap-3">
            <div 
              className="px-4 py-2 rounded-lg text-white font-medium text-sm"
              style={{ backgroundColor: primaryColor }}
            >
              버튼 미리보기
            </div>
            <span 
              className="font-bold text-lg"
              style={{ color: primaryColor }}
            >
              강조 텍스트
            </span>
            <span 
              className="font-mono text-2xl font-bold"
              style={{ color: primaryColor }}
            >
              05:23:41
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-2">
          <Button 
            variant="outline" 
            onClick={resetToDefaults}
            className="text-gray-600 border-gray-300"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            기본값으로
          </Button>
          <Button variant="gold" onClick={onSave}>
            <Palette className="w-4 h-4 mr-2" />
            색상 저장
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
