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
    'Token': 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImM5YTBjMWRlYWEyN2JjNjMyNTUzYmM4MWEyMmQ4NzY1MWM3MTMyY2IiLCJ0eXAiOiJKV1QifQ.eyJ1cEF0IjoxNzc5MzEyODI5LCJyb2xlIjoxMCwiY3VzdG9tX2VtYWlsIjoiIiwicHJvdmlkZXJfaWQiOiJhbm9ueW1vdXMiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vZ2FtZWNhc2VsYSIsImF1ZCI6ImdhbWVjYXNlbGEiLCJhdXRoX3RpbWUiOjE3NzkzMTI4MjcsInVzZXJfaWQiOiJEdVd1VXJPVWNPUHNrNzY0b3ZaVkpFbmx6YjMyIiwic3ViIjoiRHVXdVVyT1VjT1Bzazc2NG92WlZKRW5semIzMiIsImlhdCI6MTc3OTY4NjUzOSwiZXhwIjoxNzc5NjkwMTM5LCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7fSwic2lnbl9pbl9wcm92aWRlciI6ImFub255bW91cyJ9fQ.mjyySCcPQ7rLnI7OfeygGc5J9xeeYWCo53XwigJUJkbasidSibOBBM8M1OZ1c6VEaVP4NmzlxYjqf9R1GwZCf11MxNgyKMmnzvH6j_5OfiSZ8tSdA8gzoJMHyFZlm9AAl0PO4BHGvDdvdOr6NLtY8ogXcUwssQqTMabAy-4_nKgqBQJgJH0xMxUJ8lZkDZfdBTCEYhtBI5Wb8rF9t6yBqfWPHkuINuck5Z6Kl6pryztzTNz16SHlZapmSTC1oTnVHmn_H9bmK1_GNEwebEwzQ8QEGQkgbY0-nxfOTsIRR7j6WoqwcHH4ArSU5EHOVxu75ONa4sGMPvAd8nuChSHwcQ'
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