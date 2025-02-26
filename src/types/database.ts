export interface DatabaseConfig {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
}

export interface TableColumn {
  column_name: string;
  data_type: string;
  character_maximum_length: number | null;
  column_default: string | null;
  is_nullable: 'YES' | 'NO';
}

export interface TableStatistics {
  totalRecords: number;
  columnCount: number;
  columnTypes: Record<string, number>;
}

export interface QueryResult<T = unknown> {
  success: boolean;
  data: T[];
  error?: string;
}