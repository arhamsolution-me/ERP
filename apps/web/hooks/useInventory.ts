import { useQuery } from "@tanstack/react-query";
import { useApi } from "./useApi";

export interface StockLevel {
  id: string;
  sku: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  reorder_point: number | null;
  product: {
    name: string;
  };
  warehouse: {
    name: string;
  };
}

export function useInventory(warehouseId?: string) {
  const { fetcher } = useApi();

  return useQuery({
    queryKey: ["inventory", "stock", warehouseId],
    queryFn: () => 
      fetcher<{ data: StockLevel[] }>(
        warehouseId ? `/inventory/stock-levels?warehouse_id=${warehouseId}` : `/inventory/stock-levels`
      ),
  });
}
