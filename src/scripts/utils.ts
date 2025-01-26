export function parseConfigToTokens(configContent: string): Record<string, any> {

    console.log('debug parse config tokens', configContent)

    try {
        // Rimuove "module.exports =" per ottenere solo l'oggetto di configurazione
        const configString = configContent
            .replace(/module\.exports\s*=\s*/, '') // Rimuove "module.exports ="
            .trim() // Rimuove spazi bianchi extra
            .replace(/;$/, ''); // Rimuove il punto e virgola finale (se presente)
    
        // Trasforma la stringa in un oggetto JavaScript
        const config = eval(`(${configString})`);
    
        // Estrae i colori dal tema (puoi estendere per altri token)
        return config.theme?.colors || {}

    } catch (error) {
        console.error('Errore nel parsing del tailwind.config.js:', error);
        return {}
    }
}