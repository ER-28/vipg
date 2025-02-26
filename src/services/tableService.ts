import chalk from 'chalk';
import { Client } from 'pg';
import { TableColumn, QueryResult } from '../types/database.js';

export class TableService {
  constructor(private readonly client: Client) {}

  public async listTables(): Promise<QueryResult<string>> {
    try {
      const { rows } = await this.client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      return {
        success: true,
        data: rows.map(row => row.table_name)
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(chalk.red('Error fetching tables:'), errorMessage);
      return {
        success: false,
        data: [],
        error: errorMessage
      };
    }
  }

  public async describeTable(tableName: string): Promise<QueryResult<TableColumn>> {
    try {
      const { rows } = await this.client.query(`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          column_default,
          is_nullable
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);
      return {
        success: true,
        data: rows
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(chalk.red('Error describing table:'), errorMessage);
      return {
        success: false,
        data: [],
        error: errorMessage
      };
    }
  }

  public async getTableData(tableName: string, limit = 10, offset = 0): Promise<QueryResult> {
    try {
      const { rows } = await this.client.query(
        'SELECT * FROM $1:name LIMIT $2 OFFSET $3',
        [tableName, limit, offset]
      );
      return {
        success: true,
        data: rows
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(chalk.red('Error fetching table data:'), errorMessage);
      return {
        success: false,
        data: [],
        error: errorMessage
      };
    }
  }

  public async getTableCount(tableName: string): Promise<number> {
    try {
      const { rows } = await this.client.query(
        'SELECT COUNT(*) as count FROM $1:name',
        [tableName]
      );
      return parseInt(rows[0].count);
    } catch (error) {
      console.error(chalk.red('Error counting records:'), error instanceof Error ? error.message : 'Unknown error');
      return 0;
    }
  }

  public async executeQuery(query: string, params: unknown[] = []): Promise<QueryResult> {
    try {
      const { rows } = await this.client.query(query, params);
      return {
        success: true,
        data: rows
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(chalk.red('Error executing query:'), errorMessage);
      return {
        success: false,
        data: [],
        error: errorMessage
      };
    }
  }
}