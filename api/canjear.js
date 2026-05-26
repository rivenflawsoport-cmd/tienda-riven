import puppeteer from 'puppeteer';

// 🔥 FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
    getFirestore,
    collection,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc,
    getDocs,
    limit
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🔥 CONFIG FIREBASE
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

console.log("🦍 ROBOT RIVEN CONECTADO A FIREBASE");

// =======================================================
// 🔥 OBTENER PIN DISPONIBLE DESDE FIREBASE
// =======================================================

async function obtenerPinDisponible(tipoPin) {

    try {

        const q = query(
            collection(db, "pines", tipoPin, "codigos"),
            where("usado", "==", false),
            limit(1)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }

        const documento = snapshot.docs[0];

        return {
            id: documento.id,
            codigo: documento.data().codigo
        };

    } catch (error) {

        console.error("❌ Error obteniendo PIN:", error);
        return null;

    }
}

// =======================================================
// 🔥 MARCAR PIN COMO USADO
// =======================================================

async function marcarPinComoUsado(tipoPin, codigoId) {

    try {

        const referencia = doc(
            db,
            "pines",
            tipoPin,
            "codigos",
            codigoId
        );

        await updateDoc(referencia, {
            usado: true
        });

        console.log(`🔥 PIN ${codigoId} marcado como usado`);

    } catch (error) {

        console.error("❌ Error marcando PIN:", error);

    }
}

// =======================================================
// 🔥 FUNCIÓN PRINCIPAL
// =======================================================

async function ejecutarCanjeoHype(idJugador, nombreProducto) {

    console.log(`\n📦 Analizando producto...`);

    let pasosDeCanje = [];

    // ===================================================
    // 🔥 MAPA DE PRODUCTOS
    // ===================================================

    if (nombreProducto.includes("100 + 10 Bonus")) {

        pasosDeCanje.push("110");

    }

    else if (nombreProducto.includes("200 + 20 Bonus")) {

        pasosDeCanje.push("110");
        pasosDeCanje.push("110");

    }

    else if (nombreProducto.includes("520 + 52 Bonus")) {

        pasosDeCanje.push("572");

    }

    else if (nombreProducto.includes("620 + 62 Bonus")) {

        console.log("⚔️ COMBO MIXTO DETECTADO");

        pasosDeCanje.push("572");
        pasosDeCanje.push("110");

    }

    else {

        console.log("⚠️ Producto no reconocido");
        return;

    }

    const navegador = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const pagina = await navegador.newPage();

    try {

        for (let i = 0; i < pasosDeCanje.length; i++) {

            const tipoPin = pasosDeCanje[i];

            console.log(`\n🎯 Buscando PIN ${tipoPin}`);

            // ===================================================
            // 🔥 OBTENER PIN
            // ===================================================

            const pinParaUsar = await obtenerPinDisponible(tipoPin);

            if (!pinParaUsar) {

                console.log(`❌ SIN STOCK ${tipoPin}`);
                break;

            }

            console.log(`✅ PIN ENCONTRADO`);

            // ===================================================
            // 🔥 ABRIR HYPE
            // ===================================================

            await pagina.goto(
                'https://redeem.hype.games/',
                {
                    waitUntil: 'networkidle2',
                    timeout: 30000
                }
            );

            await new Promise(r => setTimeout(r, 3000));

            // ===================================================
            // 🔥 COOKIES
            // ===================================================

            try {

                const botonCookies =
                    '#didomi-notice-agree-button';

                await pagina.waitForSelector(
                    botonCookies,
                    { timeout: 3000 }
                );

                await pagina.click(botonCookies);

                console.log("🛡️ Cookies aceptadas");

            } catch (e) {}

            // ===================================================
            // 🔥 PEGAR PIN
            // ===================================================

            const inputPin = 'input[type="text"]';

            await pagina.waitForSelector(inputPin);

            await pagina.click(inputPin);

            await pagina.evaluate((selector, codigo) => {

                const input =
                    document.querySelector(selector);

                input.value = codigo;

                input.dispatchEvent(
                    new Event('input', {
                        bubbles: true
                    })
                );

            }, inputPin, pinParaUsar.codigo);

            console.log("📋 PIN PEGADO");

            await new Promise(r => setTimeout(r, 1000));

            await pagina.keyboard.press('Enter');

            console.log("⏳ Esperando formulario...");

            await new Promise(r => setTimeout(r, 7000));

            // ===================================================
            // 🔥 ESCRIBIR DATOS
            // ===================================================

            await pagina.evaluate((idDinamico) => {

                const inputs = Array.from(
                    document.querySelectorAll(
                        'input:not([type="checkbox"])'
                    )
                ).filter(i => i.clientHeight > 0);

                const escribir = (input, valor) => {

                    if (!input) return;

                    input.focus();

                    input.value = valor;

                    input.dispatchEvent(
                        new Event('input', {
                            bubbles: true
                        })
                    );

                    input.dispatchEvent(
                        new Event('change', {
                            bubbles: true
                        })
                    );
                };

                if (inputs.length >= 2) {

                    escribir(inputs[0], "Marck Evans");

                    escribir(inputs[1], "10122000");

                    escribir(
                        inputs[inputs.length - 1],
                        idDinamico
                    );
                }

                const checkbox =
                    document.querySelector(
                        'input[type="checkbox"]'
                    );

                if (checkbox) {

                    checkbox.checked = true;

                    checkbox.dispatchEvent(
                        new Event('change', {
                            bubbles: true
                        })
                    );
                }

            }, idJugador);

            console.log("✅ Datos escritos");

            await new Promise(r => setTimeout(r, 3000));

            // ===================================================
            // 🔥 VERIFICAR ID
            // ===================================================

            await pagina.evaluate(() => {

                const botones = Array.from(
                    document.querySelectorAll(
                        'button, span, div'
                    )
                );

                const boton = botones.find(el =>
                    el.textContent
                        .trim()
                        .includes('VERIFICAR ID')
                );

                if (boton) {

                    boton.click();

                }

            });

            console.log("🚀 VERIFICANDO ID");

            await new Promise(r => setTimeout(r, 5000));

            // ===================================================
            // 🔥 BOTÓN CANJEAR
            // ===================================================

            await pagina.evaluate(() => {

                const botonCanjear =
                    Array.from(
                        document.querySelectorAll('button')
                    ).find(b =>
                        b.textContent
                            .toUpperCase()
                            .includes('CANJEAR')
                    );

                if (botonCanjear) {

                    botonCanjear.click();

                }

            });

            console.log("🔥 CANJEANDO");

            await new Promise(r => setTimeout(r, 6000));

            // ===================================================
            // 🔥 MARCAR USADO
            // ===================================================

            await marcarPinComoUsado(
                tipoPin,
                pinParaUsar.id
            );

            console.log("✅ PIN QUEMADO");

            await new Promise(r => setTimeout(r, 4000));
        }

        console.log("\n🏆 PEDIDO COMPLETADO");

        await navegador.close();

    } catch (error) {

        console.error("❌ ERROR GENERAL:", error);

        await navegador.close();

    }
}

// =======================================================
// 🔥 MONITOREO DE PEDIDOS
// =======================================================

const q = query(
    collection(db, "pedidos"),
    where("estado", "==", "pendiente")
);

onSnapshot(q, async (snapshot) => {

    for (const change of snapshot.docChanges()) {

        if (change.type === "added") {

            const pedidoData = change.doc.data();

            const pedidoId = change.doc.id;

            if (
                pedidoData.producto &&
                pedidoData.producto.includes("FREE FIRE")
            ) {

                const idJugador =
                    pedidoData.player_id;

                const nombreProducto =
                    pedidoData.producto;

                console.log("\n🚨 NUEVO PEDIDO");

                console.log(nombreProducto);

                try {

                    await ejecutarCanjeoHype(
                        idJugador,
                        nombreProducto
                    );

                    const pedidoRef = doc(
                        db,
                        "pedidos",
                        pedidoId
                    );

                    await updateDoc(
                        pedidoRef,
                        {
                            estado: "completado"
                        }
                    );

                    console.log(
                        `✅ Pedido ${pedidoId} completado`
                    );

                } catch (error) {

                    console.error(
                        "❌ ERROR PEDIDO:",
                        error
                    );

                }
            }
        }
    }
});