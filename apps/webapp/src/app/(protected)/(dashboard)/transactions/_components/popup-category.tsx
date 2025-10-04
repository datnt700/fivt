import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { useCreateCategory } from '../_hooks/use-categories';

interface PopUpProps {
  openPopUp: boolean;
  closePopUp: () => void;
  onCreated: (cat: { id: string | number; name: string }) => void;
}

const PopUpCategory = ({ openPopUp, closePopUp, onCreated }: PopUpProps) => {
  const [cateValue, setCateValue] = useState<string>('');
  const handlelosePopUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).id === 'ModelContainer') {
      closePopUp();
    }
  };
  const createCategory = useCreateCategory();
  if (openPopUp !== true) return null;

  const handleCreateCategory = async () => {
    const created = await createCategory.mutateAsync(cateValue.trim());
    onCreated({ id: created.id, name: created.name });
  };

  return (
    <div
      id="ModelContainer"
      onClick={handlelosePopUp}
      className="fixed inset-0 flex justify-center items-center bg-opacity-20 backdrop-blur-sm"
    >
      <div className="p-2 bg-white w-10/12 md:w-1/2 lg:1/3 border inset-shadow-sm rounded-lg py-5 flex flex-col justify-end items-end">
        <div className="w-full p-3 justify-center items-center">
          <h2 className="font-semibold py-3 text-center text-xl">Category</h2>
          <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-orange-500 ">
            <input
              id="category"
              type="text"
              name="category"
              onChange={e => setCateValue(e.target.value)}
              className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
            />
          </div>
        </div>

        <div className="flex gap-4 p-3 ">
          <Button type="button" onClick={handleCreateCategory}>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PopUpCategory;
