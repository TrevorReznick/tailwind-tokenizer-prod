export function parseConfigToTokens(configContent: string): Record<string, any> {

    console.log('debug parse config tokens', configContent)

    try {
        // Rimuove "module.exports =" per ottenere solo l'oggetto di configurazione
        const configString = configContent
            .replace(/module\.exports\s*=\s*/, '') // Rimuove "module.exports ="
            .trim() // Rimuove spazi bianchi extra
            .replace(/;$/, ''); // Rimuove il punto e virgola finale (se presente)
    
        // Trasforma la stringa in un oggetto JavaScript
        const config = eval(`(${configString})`)

        console.log('parsed tailwind config file', config)

        console.log('debug object', typeof config)
    
        // Estrae i colori dal tema (puoi estendere per altri token)

        // Accesso alle proprietà
        const content = config.content
        const plugins = config.plugins;
        const theme = config.theme;
        const extend = config.theme.extend;
        const colors = config.theme.extend.colors;
        const fontFamily = config.theme.extend.fontFamily;
        const screens = config.theme.extend.screens;

        console.log(content)// [ "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}" ]
        console.log(plugins) // []
        console.log(theme)// { extend: { colors: [Object], fontFamily: [Object], screens: [Object] } }
        console.log(extend) // { colors: [Object], fontFamily: [Object], screens: [Object] }
        console.log(colors) // { primary: "#3490dc", secondary: "#ffed4a" }
        console.log(fontFamily)// { sans: ["Helvetica", "Arial", "sans-serif"], serif: ["Georgia", "serif"] }
        console.log(screens)

        generateCSSVariables(config)

        return config.theme?.colors || {}

    } catch (error) {
        console.error('Errore nel parsing del tailwind.config.js:', error);
        return {}
    }
}

export function generateCSSVariables(tokens) {
    
    let cssVariables = ':root {\n';
  
    // Funzione ricorsiva per gestire oggetti annidati
    const processObject = (obj, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const cssVariableName = `${prefix}${key.replace(/_/g, '-')}`;
  
        if (typeof value === 'string' || typeof value === 'number') {
          // Se il valore è una stringa o un numero, aggiungilo come variabile CSS
          cssVariables += `  --${cssVariableName}: ${value};\n`;
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Se il valore è un oggetto, chiama ricorsivamente la funzione
          processObject(value, `${cssVariableName}-`);
        } else if (Array.isArray(value)) {
          // Se il valore è un array, convertilo in una stringa separata da virgole
          cssVariables += `  --${cssVariableName}: ${value.join(', ')};\n`;
        } else if (value === null || value === undefined) {
          // Se il valore è null o undefined, ignoriamo
          console.warn(`Skipping null or undefined value for CSS variable: ${cssVariableName}`);
        } else {
          // Se il valore è di un tipo non supportato, avvisa l'utente
          console.warn(`Unsupported value type for CSS variable: ${cssVariableName}`);
        }
      }
    };
  
    // Avvia il processo
    processObject(tokens);
  
    cssVariables += '}\n';
  
    // Rimuovi righe vuote e output non necessario
    const cleanedOutput = cssVariables
      .split('\n')
      .filter(line => line.trim() !== '') // Rimuovi righe vuote
      .join('\n');
  
    console.log('CSS variables', cleanedOutput);
  
    return cleanedOutput;
  }