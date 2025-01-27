import { simpleGit } from 'simple-git'
import * as fs from 'node:fs'
import * as fsPromises from 'node:fs/promises'
import * as path from 'node:path'
import * as crypto from 'node:crypto'
import {parseConfigToTokens, generateCSSVariables} from '../scripts/utils'

export async function parseGitRepo(repoUrl: string) {
  const tempBaseDir = path.join(process.cwd(), '..', '.git-temp')
  const tempDirName = crypto.randomBytes(16).toString('hex')
  const tempDir = path.join(tempBaseDir, tempDirName)
  
  try {

    /* Crea la directory temporanea */

    await fsPromises.mkdir(tempBaseDir, { recursive: true })
    
    /* Clona il repository */

    const git = simpleGit()
    console.log('Clonazione del repository...')
    await git.clone(repoUrl, tempDir, ['--depth', '1'])

    /* Trova e analizza i file */

    console.log('Scansione dei file...')
    const files = findFilesSync(tempDir)
    console.log(`Trovati ${files.length} file da analizzare`)
    
    /* Trova il file tailwind.config.js */

    const tailwindConfigPath = findTailwindConfig(tempDir)
    if (!tailwindConfigPath) {
      throw new Error('File tailwind.config.js non trovato nel repository')
    } else {
      console.log('trovato file tailwind.config')
    }

    /* Leggi e parsa il file tailwind.config.js */

    const tailwindConfigContent = await fsPromises.readFile(tailwindConfigPath, 'utf-8')

    const tokens = await parseConfigToTokens(tailwindConfigContent)

    const cssVariables = generateCSSVariables(tokens)

    console.log('tokens', tokens)
    console.log('css variables', cssVariables)

    return

  } catch (error) {
    console.error('Errore durante l\'analisi:', error)
    throw error
  } finally {
    // Pulizia
    try {
      if (fs.existsSync(tempDir)) {
        await fsPromises.rm(tempDir, { recursive: true, force: true });
        console.log('Directory temporanea rimossa')
      }
    } catch (e) {
      console.error('Errore durante la pulizia:', e)
    }
  }
}

function findFilesSync(dir: string): string[] {
  const files: string[] = [];
  const extensions = new Set(['.jsx', '.tsx', '.astro', '.html', '.vue', '.svelte'])
  
  function scan(directory: string) {
    try {
      const entries = fs.readdirSync(directory, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(directory, entry.name)
        
        // Ignora node_modules e .git
        if (entry.isDirectory()) {
          if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
            scan(fullPath)
          }
        } else if (entry.isFile() && extensions.has(path.extname(entry.name))) {
          files.push(fullPath)
        }
      }
    } catch (e) {
      console.error(`Errore durante la scansione di ${directory}:`, e)
    }
  }
  
  scan(dir)
  return files
}

function findTailwindConfig(dir: string): string | null {
  const tailwindConfigNames = [
    'tailwind.config.js', 
    'tailwind.config.cjs', 
    'tailwind.config.ts',
    'tailwind.config.mjs'
  ]

  let tailwindConfigPath = null

  function scan(directory: string) {
    try {
      const entries = fs.readdirSync(directory, { withFileTypes: true })

      //console.log('entries', entries)
      
      for (const entry of entries) {
        const fullPath = path.join(directory, entry.name)
        
        if (entry.isDirectory()) {
          if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
            scan(fullPath)
          }
        } else if (entry.isFile() && tailwindConfigNames.includes(entry.name)) {
          tailwindConfigPath = fullPath
          return
        }
      }
    } catch (e) {
      console.error(`Errore durante la scansione di ${directory}:`, e)
    }
  }
  
  scan(dir);
  return tailwindConfigPath;
}



/*
Esempio di utilizzo
(async () => {
  try {
    const repoUrl = 'https://github.com/TrevorReznick/openfav-dev';
    const result = await parseGitRepo(repoUrl);
    console.log('Tokens:', result.tokens);
    console.log('Tailwind Classes:', result.tailwindClasses);
  } catch (error) {
    console.error('Errore durante l\'analisi:', error);
  }
})()
*/