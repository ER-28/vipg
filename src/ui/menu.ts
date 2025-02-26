import chalk from 'chalk';
import inquirer from 'inquirer';
import type { Client } from 'pg';
import { TableService } from '../services/tableService.js';

export class MenuManager {
  private readonly tableService: TableService;

  constructor(private readonly client: Client) {
    this.tableService = new TableService(client);
  }

  public async showMainMenu(): Promise<void> {
    while (true) {
      const { data: tables } = await this.tableService.listTables();
      console.log(chalk.cyan('\nAvailable tables:'));
      tables.forEach((table: any, index: number) => {
        console.log(chalk.yellow(`${index + 1}. ${table}`));
      });

      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            'Show all tables',
            'Describe a table',
            'Browse table data',
            'Execute custom query',
            'Show table statistics',
            'Disconnect and exit'
          ]
        }
      ]);

      if (action === 'Disconnect and exit') {
        await this.client.end();
        console.log(chalk.green('Database connection closed.'));
        process.exit(0);
      }

      if (action === 'Show all tables') {
        continue;
      }

      if (action === 'Execute custom query') {
        await this.handleCustomQuery();
        continue;
      }

      const { table } = await inquirer.prompt([
        {
          type: 'list',
          name: 'table',
          message: 'Select a table:',
          choices: tables
        }
      ]);

      switch (action) {
        case 'Describe a table':
          await this.handleDescribeTable(table);
          break;
        case 'Browse table data':
          await this.handleBrowseTable(table);
          break;
        case 'Show table statistics':
          await this.handleTableStatistics(table);
          break;
      }

      await this.waitForInput();
    }
  }

  private async handleDescribeTable(tableName: string): Promise<void> {
    const { data: structure } = await this.tableService.describeTable(tableName);
    console.log(chalk.cyan(`\nStructure of table '${tableName}':`));
    console.table(structure);
  }

  private async handleBrowseTable(tableName: string): Promise<void> {
    const pageSize = 10;
    let currentPage = 0;
    const totalRecords = await this.tableService.getTableCount(tableName);
    const totalPages = Math.ceil(totalRecords / pageSize);

    while (true) {
      const offset = currentPage * pageSize;
      const { data: rows } = await this.tableService.getTableData(tableName, pageSize, offset);

      console.clear();
      console.log(chalk.cyan(`\nBrowsing '${tableName}' (Page ${currentPage + 1}/${totalPages}):`));
      console.table(rows);

      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'Navigation:',
          choices: [
            ...(currentPage > 0 ? ['Previous page'] : []),
            ...(currentPage < totalPages - 1 ? ['Next page'] : []),
            'Back to main menu'
          ]
        }
      ]);

      if (action === 'Previous page') currentPage--;
      else if (action === 'Next page') currentPage++;
      else break;
    }
  }

  private async handleCustomQuery(): Promise<void> {
    const { query } = await inquirer.prompt([
      {
        type: 'input',
        name: 'query',
        message: 'Enter your SQL query:',
        validate: (input: string) => input.trim().length > 0
      }
    ]);

    const { data: results } = await this.tableService.executeQuery(query);
    console.log(chalk.cyan('\nQuery results:'));
    console.table(results);
  }

  private async handleTableStatistics(tableName: string): Promise<void> {
    const count = await this.tableService.getTableCount(tableName);
    const { data: structure } = await this.tableService.describeTable(tableName);

    console.log(chalk.cyan(`\nStatistics for table '${tableName}':`));
    console.log(chalk.yellow(`Total records: ${count}`));
    console.log(chalk.yellow(`Number of columns: ${structure.length}`));

    const columnTypes = structure.reduce<Record<string, number>>(
      (acc: { [x: string]: any }, col: { data_type: string | number }) => {
        acc[col.data_type] = (acc[col.data_type] || 0) + 1;
        return acc;
      },
      {}
    );

    console.log(chalk.yellow('\nColumn type distribution:'));
    const entries = Object.entries(columnTypes);
    for (const [type, count] of entries) {
      console.log(chalk.gray(`  ${type}: ${count}`));
    }
  }

  private async waitForInput(): Promise<void> {
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: 'Press Enter to continue...'
      }
    ]);
  }
}
