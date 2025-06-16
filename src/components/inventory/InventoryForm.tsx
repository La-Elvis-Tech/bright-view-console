
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { InventoryCategory } from '@/types/inventory';
import { CalendarIcon, Plus } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { useToast } from '@/hooks/use-toast';

const inventoryFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  category_id: z.string().min(1, 'Categoria é obrigatória'),
  current_stock: z.number().min(0, 'Estoque atual deve ser maior ou igual a 0'),
  min_stock: z.number().min(0, 'Estoque mínimo deve ser maior ou igual a 0'),
  max_stock: z.number().min(1, 'Estoque máximo deve ser maior que 0'),
  unit: z.string().min(1, 'Unidade de medida é obrigatória'),
  cost_per_unit: z.number().min(0, 'Custo por unidade deve ser maior ou igual a 0').optional(),
  supplier: z.string().optional(),
  lot_number: z.string().optional(),
  expiry_date: z.date().optional(),
  location: z.string().optional(),
});

type InventoryFormValues = z.infer<typeof inventoryFormSchema>;

interface InventoryFormProps {
  onSuccess: () => void;
  categories: InventoryCategory[];
  initialData?: Partial<InventoryFormValues>;
  mode?: 'create' | 'edit';
}

const InventoryForm: React.FC<InventoryFormProps> = ({ 
  onSuccess, 
  categories, 
  initialData,
  mode = 'create'
}) => {
  const { addItem } = useSupabaseInventory();
  const { toast } = useToast();

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      category_id: initialData?.category_id || '',
      current_stock: initialData?.current_stock || 0,
      min_stock: initialData?.min_stock || 0,
      max_stock: initialData?.max_stock || 100,
      unit: initialData?.unit || '',
      cost_per_unit: initialData?.cost_per_unit || 0,
      supplier: initialData?.supplier || '',
      lot_number: initialData?.lot_number || '',
      expiry_date: initialData?.expiry_date,
      location: initialData?.location || '',
    },
  });

  const onSubmit = async (values: InventoryFormValues) => {
    try {
      const itemData = {
        name: values.name,
        description: values.description || '',
        category_id: values.category_id,
        current_stock: values.current_stock,
        min_stock: values.min_stock,
        max_stock: values.max_stock,
        unit: values.unit,
        cost_per_unit: values.cost_per_unit || 0,
        supplier: values.supplier || '',
        lot_number: values.lot_number || '',
        expiry_date: values.expiry_date?.toISOString().split('T')[0],
        location: values.location || '',
        active: true,
        unit_id: '', // Will be set by the hook
      };

      await addItem(itemData);
      onSuccess();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o item.',
        variant: 'destructive',
      });
    }
  };

  const commonUnits = [
    'unidade', 'kg', 'g', 'mg', 'litro', 'ml', 'metro', 'cm', 'mm',
    'caixa', 'pacote', 'frasco', 'ampola', 'comprimido'
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-neutral-700 dark:text-neutral-300">Nome do Item *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Luvas Descartáveis" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-neutral-700 dark:text-neutral-300">Categoria *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-neutral-700 dark:text-neutral-300">Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descrição detalhada do item..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="current_stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-neutral-700 dark:text-neutral-300">Estoque Atual *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="min_stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-neutral-700 dark:text-neutral-300">Estoque Mínimo *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="max_stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-neutral-700 dark:text-neutral-300">Estoque Máximo *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 100)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-neutral-700 dark:text-neutral-300">Unidade de Medida *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a unidade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {commonUnits.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cost_per_unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-neutral-700 dark:text-neutral-300">Custo por Unidade (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="supplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-neutral-700 dark:text-neutral-300">Fornecedor</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: MedSupply Ltda" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lot_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-neutral-700 dark:text-neutral-300">Número do Lote</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: LOT123456" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="expiry_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-neutral-700 dark:text-neutral-300">Data de Validade</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal bg-gray-200/80 dark:bg-neutral-700/80 border-0",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-neutral-700 dark:text-neutral-300">Localização</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Armário A1, Prateleira 2" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" className="min-w-[120px] bg-lab-blue hover:bg-lab-blue/90">
            <Plus className="w-4 h-4 mr-2" />
            {mode === 'create' ? 'Adicionar Item' : 'Atualizar Item'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InventoryForm;
