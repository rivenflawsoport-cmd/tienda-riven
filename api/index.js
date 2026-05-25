import express from 'express';
import cors from 'cors';

let tokenActual = process.env.GAMETON_TOKEN;

const REFRESH_TOKEN = "AMf-vBydGzLI-wW5O-2r3KxhMUnKUptNyjYRZrZ8JPDsGMHPazKRXv5fxgzMk6EOGB4dIIoqf1WgE_Fh-0ojZNl8qjSWCWO_04xvSF8dM07wKl0LEhlW8Xd3lhgs6nPLm58Iqa0FKMMz84grQs34ChhoZb5tnuEcGFS08sgps10vxlMROjyWwImOnaTHFl6l9eC5iae4rs5k8rbFm8et0w78iXRp1i9agt1cxZ4BvS1laFNLo-rocYzGW1mcvDzX8QwkMq9Pu74kQuDKwpYSslVZj9PW3-4ddT7SWqzJLKUft8tKIUPOFTvyl0qw5EEoMKTRjvNbtBpIGsCWWDjYQeF7l7mfquabQBXOWDtedLi0N2MoJ61Uu5WfPLwELquutBiXtIb428GD30bnQA9N8mEL0GlgxiLRPllqHsBcOkQvSgw8pchihy8";

async function renovarTokenAutomatico() {
    try {

        console.log("🔄 Renovando token automáticamente...");

        const response = await fetch(
            "https://securetoken.googleapis.com/v1/token?key=AIzaSyAfRMldBEKA60sx6gTnJJTV5qo5TG8megk",
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