import puppeteer from 'puppeteer';
import fs from 'fs';

// 🦍 CONEXIÓN OFICIAL DE FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = { 
    apiKey: "AIzaSyAfRMldBEKA60sx6gTnJJTV5qo5TG8megk", 
    authDomain: "rivenflawstore.firebaseapp.com", 
    projectId: "rivenflawstore", 
    storageBucket: "rivenflawstore.firebasestorage.app", 
    messagingSenderId: "251566538187", 
    appId: "1:251566538187:web:ad54915d6f4a87e152ca4e" 
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("🦍 [ROBOT RIVEN] Conectado a la Tienda Riven Flaw. Vigilando base de datos...");

// --- FUNCIONES INTELIGENTES DE PINES ---
function obtenerPinDisponible(archivoTxt) {
    if (!fs.existsSync(archivoTxt)) return null;
    const contenido = fs.readFileSync(archivoTxt, 'utf-8').trim();
    if (!contenido) return null;
    const lineas = contenido.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    return { id: 1, codigo: lineas[0] };
}

function marcarPinComoUsado(archivoTxt) {
    if (!fs.existsSync(archivoTxt)) return;
    const contenido = fs.readFileSync(archivoTxt, 'utf-8').trim();
    const lineas = contenido.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const elResto = lineas.slice(1).join('\n');
    fs.writeFileSync(archivoTxt, elResto);
    console.log(`🗑️ El pin usado fue removido con éxito de: ${archivoTxt}`);
}

// --- FUNCIÓN PRINCIPAL ADAPTATIVA CON COMBO MIXTO ---
async function ejecutarCanjeoHype(idJugador, nombreProducto) {
    console.log(`\n📦 Analizando producto para calcular ruta de carga...`);
    
    // Armamos un mapa de cuántas vueltas dar y qué caja abrir en cada vuelta
    let pasosDeCanje = [];

    if (nombreProducto.includes("100 + 10 Bonus")) {
        // Paquete 110: Un solo pin de la caja de 110
        pasosDeCanje.push("pines_110.txt");
    } 
    else if (nombreProducto.includes("200 + 20 Bonus")) {
        // Paquete 220: Dos pines seguidos de la caja de 110
        pasosDeCanje.push("pines_110.txt");
        pasosDeCanje.push("pines_110.txt");
    } 
    else if (nombreProducto.includes("520 + 52 Bonus")) {
        // Paquete 572: Un solo pin de la caja de 572
        pasosDeCanje.push("pines_572.txt");
    } 
    else if (nombreProducto.includes("620 + 62 Bonus")) {
        // 🔥 COMBO MIXTO TOTAL: 682 DIAMANTES (572 + 110)
        console.log("⚔️ ¡Detectado combo de 682 diamantes! Activando modo mixto.");
        pasosDeCanje.push("pines_572.txt"); // Vuelta 1: quema el pin grande
        pasosDeCanje.push("pines_110.txt"); // Vuelta 2: quema el pin chico
    } else {
        console.log("⚠️ Producto no reconocido para canje automático.");
        return;
    }

    const totalVueltas = pasosDeCanje.length;
    console.log(`🎯 Plan de operaciones establecido. Total de transacciones a realizar: ${totalVueltas}`);

    const navegador = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: null,
        args: ['--start-maximized'] 
    }); 
    
    const pagina = await navegador.newPage();

    try {
        // El bucle ahora recorre el mapa inteligente que creamos arriba
        for (let i = 0; i < totalVueltas; i++) {
            const archivoTxtActual = pasosDeCanje[i];
            const vuelta = i + 1;

            console.log(`\n🔄 [Canje ${vuelta}/${totalVueltas}] Abriendo caja: ${archivoTxtActual} para el ID: ${idJugador}...`);

            const pinParaUsar = obtenerPinDisponible(archivoTxtActual);
            if (!pinParaUsar) {
                console.error(`❌ ¡ERROR DE STOCK! Te quedaste sin códigos en: ${archivoTxtActual}`);
                break; 
            }

            await pagina.goto('https://redeem.hype.games/', { waitUntil: 'networkidle2', timeout: 30000 });
            await new Promise(r => setTimeout(r, 2000));

            // Limpiar Muro de Cookies
            try {
                const botonCookies = '#didomi-notice-agree-button';
                await pagina.waitForSelector(botonCookies, { timeout: 3000 });
                await pagina.click(botonCookies);
                console.log("🛡️ Muro de privacidad despejado.");
                await new Promise(r => setTimeout(r, 1000));
            } catch (e) {}

            // Pegar PIN
            const casillaPinInicial = 'input[type="text"]';
            await pagina.waitForSelector(casillaPinInicial, { timeout: 10000 });
            await pagina.click(casillaPinInicial);
            
            await pagina.evaluate((selector, codigoPin) => {
                const input = document.querySelector(selector);
                input.value = codigoPin;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }, casillaPinInicial, pinParaUsar.codigo);

            console.log("📋 PIN cargado en el campo inicial.");
            await new Promise(r => setTimeout(r, 1000));
            await pagina.keyboard.press('Enter');
            
            console.log("⏳ Esperando formulario interno...");
            await new Promise(r => setTimeout(r, 7000));

            // BYPASS NATIVO DE CASILLAS BLINDADAS
            console.log("⚡ Forzando escritura nativa en los campos...");
            await pagina.evaluate((idDinamico) => {
                const inputs = Array.from(document.querySelectorAll('input:not([type="checkbox"])')).filter(i => i.clientHeight > 0);
                
                const fijarTextoSeguro = (elementoInput, valorTexto) => {
                    if (!elementoInput) return;
                    elementoInput.focus();
                    elementoInput.value = valorTexto;
                    elementoInput.dispatchEvent(new Event('input', { bubbles: true }));
                    elementoInput.dispatchEvent(new Event('change', { bubbles: true }));
                };

                if (inputs.length >= 2) {
                    const inputNombre = inputs.find(i => i.id.toLowerCase().includes('name') || i.placeholder.toLowerCase().includes('nom')) || inputs[0];
                    fijarTextoSeguro(inputNombre, "Marck Evans");

                    const inputFecha = inputs.find(i => i.id.toLowerCase().includes('birth') || i.placeholder.toLowerCase().includes('fech')) || inputs[1];
                    fijarTextoSeguro(inputFecha, "10-12-2000");
                    if (inputFecha.value === "") fijarTextoSeguro(inputFecha, "10122000");

                    const inputID = inputs.find(i => i.id.toLowerCase().includes('user') || i.placeholder.toLowerCase().includes('id')) || inputs[inputs.length - 1];
                    fijarTextoSeguro(inputID, idDinamico);
                }

                const selectPais = document.querySelector('select');
                if (selectPais) {
                    const opcionArg = Array.from(selectPais.options).find(o => o.text.toLowerCase().includes('arg') || o.value === 'AR');
                    if (opcionArg) {
                        selectPais.value = opcionArg.value;
                    } else {
                        selectPais.selectedIndex = 1;
                    }
                    selectPais.dispatchEvent(new Event('change', { bubbles: true }));
                }

                const checkbox = document.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.checked = true;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }, idJugador);

            console.log(`✅ Datos forzados.`);

            // Pausa para activación de botón
            console.log("⏳ Esperando 3 segundos a que la web valide el ID...");
            await pagina.evaluate(() => {
                Array.from(document.querySelectorAll('input')).forEach(i => i.blur());
            });
            await new Promise(r => setTimeout(r, 3000));

            // Clic en Verificar ID
            console.log("🚀 Presionando el botón [VERIFICAR ID]...");
            await pagina.evaluate(() => {
                const elementosInteractivos = Array.from(document.querySelectorAll('button, span, div, p'));
                const botonReal = elementosInteractivos.find(el => el.textContent.trim() === 'VERIFICAR ID' && el.children.length === 0) 
                                   || elementosInteractivos.find(el => el.textContent.trim() === 'VERIFICAR ID');

                if (botonReal) {
                    botonReal.removeAttribute('disabled');
                    botonReal.focus();
                    botonReal.click();
                    botonReal.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                }
            });
            console.log("✅ Verificación enviada.");

            // Espera carga de servidor
            console.log("⏳ Esperando 5 segundos la respuesta de Garena...");
            await new Promise(r => setTimeout(r, 5000));

            console.log("🔥 Presionando botón final [CANJEAR]...");
            await pagina.evaluate(() => {
                const botonCanjear = Array.from(document.querySelectorAll('button')).find(b => b.textContent.toUpperCase().includes('CANJEAR'));
                if (botonCanjear) {
                    botonCanjear.click();
                }
            });

            // Espera final por transacción
            await new Promise(r => setTimeout(r, 6000));
            
            // Borramos el pin que se usó en ESTA vuelta específica
            marcarPinComoUsado(archivoTxtActual);
            console.log(`🎉 Transacción ${vuelta} finalizada.`);
            
            await new Promise(r => setTimeout(r, 4000));
        }

        console.log(`\n🏆 ¡TODO EL COMBO FUE ENTREGADO DE FORMA EXITOSA!`);
        await navegador.close();
    } catch (error) {
        console.error("\n❌ Error crítico durante la automatización en Hype:", error);
        await navegador.close();
        throw error;
    }
}

// --- MOTOR DE MONITOREO EN TIEMPO REAL ---
const q = query(collection(db, "pedidos"), where("estado", "==", "pendiente"));

onSnapshot(q, async (snapshot) => {
    for (const change of snapshot.docChanges()) {
        if (change.type === "added") {
            const pedidoData = change.doc.data();
            const pedidoId = change.doc.id;
            
            if (pedidoData.producto && pedidoData.producto.includes("FREE FIRE (SALDO)")) {
                const idJugador = pedidoData.player_id;
                const nombreProducto = pedidoData.producto;
                
                console.log(`\n🚨 ¡NUEVO PEDIDO DETECTADO EN LA WEB!`);
                console.log(`🎮 Producto: ${nombreProducto}`);
                console.log(`⚡ ID Jugador: ${idJugador}`);
                
                try {
                    await ejecutarCanjeoHype(idJugador, nombreProducto);
                    
                    // Al terminar todo el combo mixto, actualizamos el estado
                    const pedidoRef = doc(db, "pedidos", pedidoId);
                    await updateDoc(pedidoRef, { estado: "completado" });
                    console.log(`✅ ¡Pedido ${pedidoId} marcado como COMPLETADO en la web!`);
                    
                } catch (error) {
                    console.error("❌ Error crítico en el canjeo automático:", error);
                }
            }
        }
    }
});