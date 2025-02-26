import chalk from 'chalk';
import { DatabaseManager } from './config/database.js';
import { MenuManager } from './ui/menu.js';

async function main(): Promise<void> {
  try {
    console.log(chalk.blue('Welcome to Database Navigator!'));

    const dbManager = DatabaseManager.getInstance();
    const config = await dbManager.getConnectionConfig();
    const client = await dbManager.connect(config);

    if (client) {
      const menuManager = new MenuManager(client);
      await menuManager.showMainMenu();
    }
  } catch (error) {
    console.error(
      chalk.red('Fatal error:'),
      error instanceof Error ? error.message : 'Unknown error'
    );
    process.exit(1);
  }
}

main();
