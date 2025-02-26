import chalk from 'chalk';
import inquirer from 'inquirer';
import pg from 'pg';
import type { DatabaseConfig } from '../types/database.js';

export class DatabaseManager {
  private static instance: DatabaseManager;
  private client: pg.Client | null = null;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async getConnectionConfig(): Promise<DatabaseConfig> {
    return inquirer.prompt<DatabaseConfig>([
      {
        type: 'input',
        name: 'host',
        message: 'Enter database host:',
        default: 'localhost'
      },
      {
        type: 'input',
        name: 'port',
        message: 'Enter database port:',
        default: '5432'
      },
      {
        type: 'input',
        name: 'user',
        message: 'Enter database user:',
        default: 'postgres'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter database password:'
      },
      {
        type: 'input',
        name: 'database',
        message: 'Enter database name:'
      }
    ]);
  }

  public async connect(config: DatabaseConfig): Promise<pg.Client | null> {
    try {
      this.client = new pg.Client({
        host: config.host,
        port: Number(config.port),
        user: config.user,
        password: config.password,
        database: config.database
      });
      await this.client.connect();
      console.log(chalk.green('✓ Connected to database successfully!'));
      return this.client;
    } catch (error) {
      console.error(
        chalk.red('Error connecting to database:'),
        error instanceof Error ? error.message : 'Unknown error'
      );
      return null;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.end();
      this.client = null;
      console.log(chalk.green('Database connection closed.'));
    }
  }
}
