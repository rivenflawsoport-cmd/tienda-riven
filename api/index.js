import express from 'express';
import cors from 'cors';

let tokenActual = process.env.GAMETON_TOKEN;

const REFRESH_TOKEN = "AMf-vBwk4Yhl06IWQKocFNcxtxRtTq1XejevOM_Kof6WAfsqhE00Mt_ElTF3q4Zfee2achbhl5orD89JxgpXJSKaiRBAD0lhhgosv4bvDhWrGNOyIR_uhc1gIjo1jahE62zSWWk_7YE4DWtIrvmwzObGmo6Enbw078MpRJUZzJzmzq6rz11DivJBqPy_E7vT_IsDFMXvhQmurHC_ERghx71f9mrlINmYcMG1SRMLt6DVV9MfI3Ymu9pio5fa5HxTRChZMN1IvystrnnqylIynKVUKcr_UQifnWlnN2b9li1FVzWsut02aV90R842r1z-Hfi4guuh3ZSMpMr6EYc_vvYvRylUHyU7biIA6rC03Ky01USgYfrKjQGCKOLsvU0stDiOT2vD9f29cD5CY2tr1pH8RMtjhpTvHkCSTPF7XwN92kjoRuVVXh0";

async function renovarTokenAutomatico() {
    try {

        console.log("🔄 Renovando token automáticamente...");

        const response = await fetch(
            "https://securetoken.googleapis.com/v1/token?key=AIzaSyAuySk-2VXIkK1UFMmn3CHyCGbVkEXdofE",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `grant_type=refresh_token&refresh_token=${REFRESH_TOKEN}`
            }
        );

        const data = await response.json();

        if (data.id_token) {

            tokenActual = data.id_token;

            console.log("✅ Token renovado automáticamente");

            return true;

        } else {

            console.log("❌ Error renovando token");
            console.log(data);

            return false;
        }

    } catch (error) {

        console.log("❌ Error total renovando token");
        console.log(error);

        return false;
    }
}

async function actualizarToken(nuevoToken) {
    tokenActual = nuevoToken;
    console.log("✅ Token actualizado automáticamente");
}

const app = express();

app.use(cors());
app.use(express.json());

console.log("🚀 API ACTIVA");

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

        console.log("📡 STATUS:", response.status);

        if (response.status === 401 || response.status === 403) {

    console.log("⚠️ TOKEN EXPIRADO");

    const renovado = await renovarTokenAutomatico();

    if (renovado) {
        return await consultarNick(idJugador);
    }

}

        const texto = await response.text();

        console.log("📨 RESPUESTA CRUDA:");
console.log(texto);

const data = JSON.parse(texto);

console.log("📦 JSON:");
console.log(data);

        if (data.userName) {

            return {
                status: "success",
                id: data.userId,
                nickname: data.userName
            };

        } else {

            return {
                status: "error",
                message: "No se encontró nickname"
            };

        }

    } catch (error) {

        console.log("❌ ERROR:", error.message);

        return {
            status: "error",
            message: error.message
        };

    }
}

app.get('/verificar/:id', async (req, res) => {

    const id = req.params.id;

    const resultado = await consultarNick(id);

    res.json(resultado);

});

app.listen(3000, () => {

    console.log("🌎 http://localhost:3000");

});