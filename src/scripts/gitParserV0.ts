/**
 * Funzione principale per convertire il file tailwind.config.js in token di design.
 * @param configContent Il contenuto del file tailwind.config.js come stringa.
 * @returns Un oggetto contenente i token, le variabili CSS e gli stili dei componenti.
 */
export async function convertTailwindToTokens(configContent: string) {
  // Estrae i token dal file di configurazione
  const tokens = parseConfigToTokens(configContent)

  // Genera le variabili CSS e gli stili dei componenti
  const cssVariables = generateCSSVariables(tokens)
  const componentStyles = generateComponentStyles(tokens)

  // Restituisce i risultati
  return {
    tokens,
    cssVariables,
    componentStyles,
  };
}

/**
 * Estrae i token di design dal contenuto del file tailwind.config.js.
 * @param configContent Il contenuto del file tailwind.config.js come stringa.
 * @returns Un oggetto contenente i token di design (es. colori).
 */
function parseConfigToTokens(configContent: string) {
  try {
    // Esegue il contenuto del file per ottenere l'oggetto di configurazione
    const config = eval(`(${configContent})`);
    // Estrae i colori dal tema (puoi estendere per altri token)
    return config.theme?.colors || {};
  } catch (error) {
    console.error('Errore nel parsing del tailwind.config.js:', error);
    return {};
  }
}

/**
 * Genera variabili CSS basate sui token di design.
 * @param tokens I token di design (es. colori).
 * @returns Una stringa contenente le variabili CSS.
 */
function generateCSSVariables(tokens: any) {
  let cssVariables = ':root {\n';
  for (const [key, value] of Object.entries(tokens)) {
    if (typeof value === 'string') {
      // Aggiunge una variabile CSS per ogni token
      cssVariables += `  --${key.replace(/_/g, '-')}: ${value};\n`;
    } else if (typeof value === 'object') {
      // Gestisce i token nidificati (es. colori con varianti)
      for (const [subKey, subValue] of Object.entries(value)) {
        cssVariables += `  --${key}-${subKey.replace(/_/g, '-')}: ${subValue};\n`;
      }
    }
  }
  cssVariables += '}\n';
  return cssVariables;
}

/**
 * Genera stili CSS per i componenti basati sui token di design.
 * @param tokens I token di design (es. colori).
 * @returns Una stringa contenente gli stili CSS per i componenti.
 */
function generateComponentStyles(tokens: any) {
  let componentStyles = '';
  for (const [key, value] of Object.entries(tokens)) {
    if (typeof value === 'string') {
      // Aggiunge uno stile per ogni token
      componentStyles += `.bg-${key.replace(/_/g, '-')} { background-color: var(--${key.replace(/_/g, '-')}); }\n`;
    } else if (typeof value === 'object') {
      // Gestisce i token nidificati (es. colori con varianti)
      for (const [subKey, subValue] of Object.entries(value)) {
        componentStyles += `.bg-${key}-${subKey.replace(/_/g, '-')} { background-color: var(--${key}-${subKey.replace(/_/g, '-')}); }\n`;
      }
    }
  }
  return componentStyles;
}