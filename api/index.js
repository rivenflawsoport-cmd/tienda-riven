import express from 'express';
import cors from 'cors';

let tokenActual = process.env.GAMETON_TOKEN || "";

// 👇 AQUÍ DEBES PEGAR EL NUEVO REFRESH TOKEN QUE SAQUES CON F12
const REFRESH_TOKEN = "PEGA_AQUÍ_TU_NUEVO_REFRESH_TOKEN_DE_GAMETON";

async function renovarTokenAutomatico() {
    try {
        console.log("🔄 Renovando token automáticamente...");
        const response = await fetch(
            "https://securetoken.googleapis.com/v1/token?key=AIzaSyAuySk-2VXIkK1UFMmn3CHyCGbVkEXdofE",
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `grant_type=refresh_token&refresh_token=${REFRESH_TOKEN}`
            }
        );

        const data = await response.json();

        if (data.id_token) {
            tokenActual = data.id_token;
            console.log("✅ Token renovado exitosamente");
            return true;
        } else {
            console.log("❌ Error renovando token. Gameton probablemente mató tu Refresh Token.");
            console.log(data);
            return false;
        }
    } catch (error) {
        console.log("❌ Error fatal al intentar conectar con Google Identity");
        console.log(error);
        return false;
    }
}

const app = express();
app.use(cors());
app.use(express.json());

console.log("🚀 API DE RIVEN ACTIVA");

async function consultarNick(idJugador) {
    console.log("📦 Consultando ID:", idJugador);
    try {
        const response = await fetch(
            'https://apicloud.info.bo/v0/gameData/getUserNameByClient?DIRECTOAA',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Referer': 'https://gameton.net/',
                    'Origin': 'https://gameton.net',
                    'User-Agent': 'Mozilla/5.0',
                    'Token': tokenActual
                },
                body: JSON.stringify({
                    uidGame: "0bDdrU6CqEh9kn28NPRj",
                    userId: idJugador,
                    zoneId: "0000"
                })
            }
        );

        console.log("📡 STATUS GAMETON:", response.status);

        // Si el token actual expiró
        if (response.status === 401 || response.status === 403) {
            console.log("⚠️ TOKEN EXPIRADO, INTENTANDO RENOVAR...");
            const renovado = await renovarTokenAutomatico();
            
            if (renovado) {
                // Si se renovó, volvemos a intentar la consulta
                return await consultarNick(idJugador);
            } else {
                // Si no se pudo renovar, detenemos el proceso para no crashear
                return {
                    status: "error",
                    message: "REFRESH_TOKEN_MUERTO"
                };
            }
        }

        const texto = await response.text();
        const data = JSON.parse(texto);

        if (data.userName) {
            return { status: "success", id: data.userId, nickname: data.userName };
        } else {
            return { status: "error", message: "Jugador no existe" };
        }

    } catch (error) {
        console.log("❌ ERROR EN FETCH:", error.message);
        return { status: "error", message: "Error de red interno" };
    }
}

app.get('/verificar/:id', async (req, res) => {
    const id = req.params.id;
    const resultado = await consultarNick(id);
    res.json(resultado);
});

app.listen(3000, () => {
    console.log("🌎 Servidor corriendo en http://localhost:3000");
});