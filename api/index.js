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
    'Token': 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImM5YTBjMWRlYWEyN2JjNjMyNTUzYmM4MWEyMmQ4NzY1MWM3MTMyY2IiLCJ0eXAiOiJKV1QifQ.eyJ1cEF0IjoxNzc5MzEyODI5LCJyb2xlIjoxMCwiY3VzdG9tX2VtYWlsIjoiIiwicHJvdmlkZXJfaWQiOiJhbm9ueW1vdXMiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vZ2FtZWNhc2VsYSIsImF1ZCI6ImdhbWVjYXNlbGEiLCJhdXRoX3RpbWUiOjE3NzkzMTI4MjcsInVzZXJfaWQiOiJEdVd1VXJPVWNPUHNrNzY0b3ZaVkpFbmx6YjMyIiwic3ViIjoiRHVXdVVyT1VjT1Bzazc2NG92WlZKRW5semIzMiIsImlhdCI6MTc3OTUwNzc0MywiZXhwIjoxNzc5NTExMzQzLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7fSwic2lnbl9pbl9wcm92aWRlciI6ImFub255bW91cyJ9fQ.Bh8-QPYByXyl7ilPgVcGItMJ71UFkXFTOUcJMTKApDy2iJt7_DSWj0EbOHgv-d3psf06a7NJPwFibJsjMoeP2vJpd5OFXarhyBLZY3h6G2Kas-BbaZu9BJArqi7_lw14mAtLceYqeZ-Nozr3z6Xbu0gJdZg-HoWDBTRLMcPAlsVgxTQQmXyjh2j6oR_EGLxI4kUmtN2ohmlbnv196Fb9eWhLvVe-FJWhnhUloG14R_7NMlEtEZVETIdDnWWmupgZ9gw6VaxovbOnN_zGOWe9kxlthuwrNThI9yWR0U2eyTE-9tDEpIij6L_WPnau2kbvWMVUMxr8ubvepE-7kg9iRQ'
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

        console.log("📨 RESPUESTA:");
        console.log(texto);

        const data = JSON.parse(texto);

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