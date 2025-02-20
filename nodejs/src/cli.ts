import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {createInterface} from 'node:readline/promises';
import {KEYWORDS} from './scanner/keywords';
import {TripleS} from './triples';

export const cli = async () => {
  const triples = new TripleS();
  const parsedArgs = await yargs(hideBin(process.argv))
    .option('path', {
      alias: 'p',
      type: 'string',
      description: 'Path to the file run',
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      default: false,
      description: 'Run with verbose logging',
    })
    .showHelpOnFail(true)
    .parse();

  if (parsedArgs.path) {
    triples.runFile(parsedArgs.path);
  } else {

    // REPL
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      completer: (line) => {
        const suggestions = Object.keys(KEYWORDS);
        const hits = suggestions.filter((c) => c.startsWith(line));
        return [hits.length ? hits : suggestions, line];
      },
    });

    while (true) {
      const input = await rl.question('> ').then((input) => input.trim());

      if (input === '') {
        continue;
      }

      if (input === 'exit') {
        break;
      }

      triples.run(input);
    }

    rl.close();
  }
};

