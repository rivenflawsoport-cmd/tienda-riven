// RIVEN FLAW - MÓDULO DE SEGURIDAD JURÍDICA INTEGRAL
// Este archivo registra la identidad digital para prevención de fraudes.

let infoSeguridad = {
    ip: "NO_DETECTADA",
    dispositivo: navigator.userAgent, // Captura si es Android, iPhone, PC, etc.
    hora: new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' }) // Hora exacta de Perú
};

async function activarEscudoRiven() {
    try {
        // Obtenemos la IP del cliente
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        
        infoSeguridad.ip = data.ip;

        // Guardamos todo el bloque de seguridad en el almacenamiento local
        // Esto crea una "huella digital" del usuario en su navegador
        localStorage.setItem('riven_flaw_ip', infoSeguridad.ip);
        localStorage.setItem('riven_flaw_device', infoSeguridad.dispositivo);
        localStorage.setItem('riven_flaw_timestamp', infoSeguridad.hora);

        console.log("🛡️ RIVEN FLAW: Escudo de seguridad activo y monitoreando.");
    } catch (e) {
        console.error("⚠️ RIVEN FLAW: Error al conectar con el servidor de seguridad.");
    }
}

// Iniciar el monitoreo apenas carga el archivo
activarEscudoRiven();

// Esta función es la que llamaremos desde los botones de compra de Free Fire o Index
function obtenerIdentificadorSeguridad() {
    const ip = localStorage.getItem('riven_flaw_ip') || "IP_OCULTA";
    const fecha = localStorage.getItem('riven_flaw_timestamp') || "HORA_NO_SINCRO";
    
    // Retornamos un código compacto para el mensaje de WhatsApp
    return `${ip} | REF: ${fecha}`;
}