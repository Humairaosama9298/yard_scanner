export interface ContainerRecord {
  id: number;
  created_at: string;
  container_no: string;
  truck_no: string;
  status: string;
}

export type ContainerInsert = Omit<ContainerRecord, 'id' | 'created_at'>;
