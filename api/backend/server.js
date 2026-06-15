const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());
function cargarPines() {
    const data = fs.readFileSync("pines.json", "utf8");
    return JSON.parse(data);
}

function guardarPines(pines) {
    fs.writeFileSync("pines.json", JSON.stringify(pines, null, 2));
}
function obtenerPin(cantidad) {

    const pines = cargarPines();

    if (!pines[cantidad]) {
        return null;
    }

    if (pines[cantidad].length === 0) {
        return null;
    }

    const pin = pines[cantidad].shift();

    guardarPines(pines);

    return pin;
}

app.get("/", (req, res) => {
    res.send("🔥 Backend funcionando correctamente");
});

app.get("/pines/:cantidad", (req, res) => {

    const cantidad = req.params.cantidad;

    const pin = obtenerPin(cantidad);

    if (!pin) {
        return res.status(404).json({
            error: "No hay pines disponibles"
        });
    }

    res.json({
        success: true,
        pin: pin
    });

});

app.listen(3000, () => {
    console.log("🚀 Servidor iniciado en puerto 3000");
});