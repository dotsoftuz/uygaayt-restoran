'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Controller, useForm } from 'react-hook-form';

export default function CreateOrder({ onSubmit }) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      toyxona: '',
      nikoh: '',
      bazm: '',
      sana: '',
      kameraSoni: 1,
      telefon: '',
      mijozIsmi: '',
      options: {
        nikoh: false,
        fotosessiya: false,
        bazm: false,
        chimilidq: false,
        elOshi: false,
        fotixaTuy: false,
        kelinSalom: false,
        qizBazm: false,
        loveStory: false,
      },
      albom: 'A4',
      fleshka: false,
      pramoyEfir: false,
      operatorlar: {
        opr1: '',
        opr2: '',
        ronin: '',
        kran: '',
        camera360: '',
      },
      qoshimcha: {
        foto: '',
        nahor: '',
        kelinSalom: '',
        pramoyEfir: '',
        montaj: '',
      },
      narx: 0,
    },
  });

  const onFormSubmit = (data) => {
    console.log(data);
    reset();
  };

  return (
    <div className="my-4">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Asosiy ma'lumotlar
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mijozIsmi">Mijoz ismi</Label>
              <Input
                id="mijozIsmi"
                {...register('mijozIsmi', {
                  required: 'Mijoz ismi majburiy',
                })}
                placeholder="Mijoz ismini kiriting"
              />
              {errors.mijozIsmi && (
                <p className="text-sm text-red-500">
                  {errors.mijozIsmi.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefon">Telefon</Label>
              <Input
                id="telefon"
                type="tel"
                {...register('telefon', {
                  required: 'Telefon raqami majburiy',
                })}
                placeholder="+998 90 123 45 67"
              />
              {errors.telefon && (
                <p className="text-sm text-red-500">{errors.telefon.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="toyxona">To'yxona</Label>
              <Input
                id="toyxona"
                {...register('toyxona', {
                  required: "To'yxona nomi majburiy",
                })}
                placeholder="To'yxona nomini kiriting"
              />
              {errors.toyxona && (
                <p className="text-sm text-red-500">{errors.toyxona.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nikoh">Nikoh</Label>
              <Input
                id="nikoh"
                {...register('nikoh')}
                placeholder="Nikoh joyini kiriting"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bazm">Bazm</Label>
              <Input
                id="bazm"
                {...register('bazm')}
                placeholder="Bazm joyini kiriting"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sana">Sana</Label>
              <Controller
                name="sana"
                control={control}
                rules={{ required: 'Sana majburiy' }}
                render={({ field }) => (
                  <DatePicker value={field.value} onChange={field.onChange} className="w-full" />
                )}
              />
              {errors.sana && (
                <p className="text-sm text-red-500">{errors.sana.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="kameraSoni">Kamera soni</Label>
              <Input
                id="kameraSoni"
                type="number"
                min="1"
                {...register('kameraSoni', {
                  required: true,
                  valueAsNumber: true,
                })}
              />
            </div>
          </div>
        </div>

        {/* Service Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Xizmatlar</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { id: 'nikoh', label: 'Nikoh' },
              { id: 'fotosessiya', label: 'Fotosessiya' },
              { id: 'bazm', label: 'Bazm' },
              { id: 'chimilidq', label: 'Chimilidq' },
              { id: 'elOshi', label: 'El oshi' },
              { id: 'fotixaTuy', label: 'Fotixa tuy' },
              { id: 'kelinSalom', label: 'Kelin salom' },
              { id: 'qizBazm', label: 'Qiz bazm' },
              { id: 'loveStory', label: 'Love Story' },
            ].map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Controller
                  name={`options.${option.id}`}
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id={option.id}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label
                  htmlFor={option.id}
                  className="cursor-pointer text-sm font-normal"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Album Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Albom tanlash
          </h3>
          <Controller
            name="albom"
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex gap-4"
              >
                {['A4', '30x30', 'A3'].map((size) => (
                  <div key={size} className="flex items-center space-x-2">
                    <RadioGroupItem value={size} id={size} />
                    <Label
                      htmlFor={size}
                      className="cursor-pointer font-normal"
                    >
                      {size}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
        </div>

        {/* Additional Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Qo'shimcha</h3>
          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <Controller
                name="fleshka"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="fleshka"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="fleshka" className="cursor-pointer font-normal">
                Fleshkaga yozish
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Controller
                name="pramoyEfir"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="pramoyEfir"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label
                htmlFor="pramoyEfir"
                className="cursor-pointer font-normal"
              >
                Pramoy efir
              </Label>
            </div>
          </div>
        </div>

        {/* Operators */}
        <div className="hidden space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Operatorlar</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="opr1">Operator 1</Label>
              <Input
                id="opr1"
                {...register('operatorlar.opr1')}
                placeholder="Operator 1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="opr2">Operator 2</Label>
              <Input
                id="opr2"
                {...register('operatorlar.opr2')}
                placeholder="Operator 2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ronin">Ronin</Label>
              <Input
                id="ronin"
                {...register('operatorlar.ronin')}
                placeholder="Ronin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kran">Kran</Label>
              <Input
                id="kran"
                {...register('operatorlar.kran')}
                placeholder="Kran"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="camera360">360 Kamera</Label>
              <Input
                id="camera360"
                {...register('operatorlar.camera360')}
                placeholder="360"
              />
            </div>
          </div>
        </div>

        {/* Additional Fields */}
        <div className="hidden space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Qo'shimcha maydonlar
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="foto">Foto</Label>
              <Input
                id="foto"
                {...register('qoshimcha.foto')}
                placeholder="Foto paket"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nahor">Nahor</Label>
              <Input
                id="nahor"
                {...register('qoshimcha.nahor')}
                placeholder="Nahor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kelinSalomQoshimcha">Kelin salom</Label>
              <Input
                id="kelinSalomQoshimcha"
                {...register('qoshimcha.kelinSalom')}
                placeholder="Kelin salom"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pramoyEfirQoshimcha">Pramoy efir</Label>
              <Input
                id="pramoyEfirQoshimcha"
                {...register('qoshimcha.pramoyEfir')}
                placeholder="Pramoy efir"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="montaj">Montaj</Label>
              <Input
                id="montaj"
                {...register('qoshimcha.montaj')}
                placeholder="Montaj"
              />
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Narx</h3>
          <div className="space-y-2">
            <Label htmlFor="narx">Narx (so'm)</Label>
            <Input
              id="narx"
              type="number"
              {...register('narx', { valueAsNumber: true })}
              placeholder="Narxni kiriting"
            />
            <p className="text-sm text-muted-foreground">
              Avtomatik hisoblash keyinroq qo'shiladi
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-4">
          <Button type="submit" size="lg" className="min-w-[200px]">
            Buyurtmani saqlash
          </Button>
        </div>
      </form>
    </div>
  );
}
