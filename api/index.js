import express from 'express';
import cors from 'cors';

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
    'Token': process.env.GAMETON_TOKEN
},

                body: JSON.stringify({
                    uidGame: "0bDdrU6CqEh9kn28NPRj",
                    userId: idJugador,
                    zoneId: "0000"
                })
            }
        );

        console.log("📡 STATUS:", response.status);

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