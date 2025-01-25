import * as fsPromises from 'node:fs/promises'


async function extractTailwindClasses(files: string[]): Promise<Set<string>> {
  const classSet = new Set<string>();
  const patterns = [
    /class(Name)?=["']([^"']*)["']/g,           // class="..." o className="..."
    /class(Name)?\{{2}([^}]*)\}{2}/g,           // class={{...}}
    /:class=["']([^"']*)["']/g,                 // Vue :class="..."
    /\bclass:\w+\s*=\s*["']([^"']*)["']/g,      // Svelte class:name="..."
    /classes:?\s*=\s*["']([^"']*)["']/g         // classes="..."
  ];
  
  for (const file of files) {
    try {
      const content = await fsPromises.readFile(file, 'utf-8');
      
      for (const regex of patterns) {
        let match;
        while ((match = regex.exec(content)) !== null) {
          const classes = (match[2] || match[1] || '').split(/\s+/)
          classes.forEach(cls => {
            const trimmed = cls.trim()
            if (trimmed && !trimmed.includes('${') && !trimmed.includes('{') && !trimmed.includes('}')) {
              classSet.add(trimmed);
            }
          })
        }
      }
    } catch (e) {
      console.error(`Errore durante l'analisi del file ${file}:`, e)
    }
  }
  
  return classSet;
}

// Helper functions to be implemented
function parseConfigToTokens(configContent: string) {
  // Implement parsing logic
  // Esempio semplificato: estrae le colori dal tailwind.config.js
  try {
    const config = eval(`(${configContent})`);
    return config.theme?.colors || {};
  } catch (error) {
    console.error('Errore nel parsing del tailwind.config.js:', error);
    return {};
  }
}