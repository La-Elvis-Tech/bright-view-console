
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Package, Droplets, TestTube } from 'lucide-react';

interface ExamMaterial {
  inventory_item_id: string;
  item_name: string;
  quantity_required: number;
  current_stock: number;
  available_stock: number;
  sufficient_stock: boolean;
  estimated_cost: number;
  material_type?: string;
}

interface MaterialValidation {
  canSchedule: boolean;
  insufficientMaterials: string[];
  totalEstimatedCost: number;
  materials: ExamMaterial[];
}

interface MaterialValidationProps {
  validation: MaterialValidation | null;
  loading: boolean;
  bloodVolume?: number;
  estimatedTubes?: number;
}

const MaterialValidation: React.FC<MaterialValidationProps> = ({ 
  validation, 
  loading, 
  bloodVolume, 
  estimatedTubes 
}) => {
  if (loading) {
    return (
      <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-neutral-900 dark:text-neutral-100">
            <Package className="h-5 w-5 text-blue-600" />
            Validando Materiais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-neutral-600 dark:text-neutral-400">
              Verificando disponibilidade de materiais...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!validation) {
    return null;
  }

  const getMaterialIcon = (materialType?: string) => {
    switch (materialType) {
      case 'blood_tube':
        return <TestTube className="h-4 w-4 text-red-500" />;
      case 'reagent':
        return <Droplets className="h-4 w-4 text-blue-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMaterialTypeLabel = (materialType?: string) => {
    switch (materialType) {
      case 'blood_tube':
        return 'Tubo de Sangue';
      case 'reagent':
        return 'Reagente';
      default:
        return 'Consumível';
    }
  };

  const groupedMaterials = validation.materials.reduce((acc, material) => {
    const type = material.material_type || 'consumable';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(material);
    return acc;
  }, {} as Record<string, ExamMaterial[]>);

  return (
    <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-neutral-900 dark:text-neutral-100">
          <Package className="h-5 w-5 text-blue-600" />
          Validação de Materiais
          {validation.canSchedule ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informações da coleta de sangue */}
        {(bloodVolume || estimatedTubes) && (
          <div className="grid grid-cols-2 gap-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            {bloodVolume && (
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">{bloodVolume.toFixed(1)}ml</div>
                <div className="text-sm text-red-800 dark:text-red-300">Volume Total</div>
              </div>
            )}
            {estimatedTubes && (
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">{estimatedTubes}</div>
                <div className="text-sm text-red-800 dark:text-red-300">Tubos Necessários</div>
              </div>
            )}
          </div>
        )}

        {/* Status geral */}
        <Alert className={validation.canSchedule ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className={validation.canSchedule ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}>
            {validation.canSchedule 
              ? 'Todos os materiais estão disponíveis para o agendamento.'
              : `Materiais insuficientes: ${validation.insufficientMaterials.length} item(s)`
            }
          </AlertDescription>
        </Alert>

        {/* Lista de materiais por tipo */}
        {validation.materials.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
              Materiais Necessários:
            </h4>
            
            {Object.entries(groupedMaterials).map(([materialType, materials]) => (
              <div key={materialType} className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {getMaterialIcon(materialType)}
                  {getMaterialTypeLabel(materialType)}
                </div>
                
                {materials.map((material) => (
                  <div
                    key={material.inventory_item_id}
                    className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg ml-6"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {material.item_name}
                        </span>
                        <Badge variant={material.sufficient_stock ? 'default' : 'destructive'}>
                          {material.sufficient_stock ? 'Disponível' : 'Insuficiente'}
                        </Badge>
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        Necessário: {material.quantity_required} | 
                        Disponível: {material.available_stock} | 
                        Estoque total: {material.current_stock}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-neutral-900 dark:text-neutral-100">
                        R$ {material.estimated_cost.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            
            {/* Custo total */}
            <div className="flex justify-between items-center pt-3 border-t border-neutral-200 dark:border-neutral-700">
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                Custo Total Estimado:
              </span>
              <span className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
                R$ {validation.totalEstimatedCost.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Materiais insuficientes */}
        {validation.insufficientMaterials.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-700 dark:text-red-300">
              Materiais com Estoque Insuficiente:
            </h4>
            <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
              {validation.insufficientMaterials.map((material, index) => (
                <li key={index} className="flex items-center gap-2">
                  <XCircle className="h-3 w-3" />
                  {material}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MaterialValidation;
