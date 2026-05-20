// Variables globales para la conexión
let dispositivoBluetooth = null;
let caracteristicaBluetooth = null;
let robotNombre = "";

// Identificadores estándar para módulos HM-10
const SERVICE_UUID = "0000ffe0-0000-1000-8000-00805f9b34fb";
const CHARACTERISTIC_UUID = "0000ffe1-0000-1000-8000-00805f9b34fb";

/**
 * Inicia la conexión con el robot elegido
 */
async function conectarRobot(nombre) {
    robotNombre = nombre;
    
    // Cambiar visualmente la interfaz
    document.getElementById('pantalla-seleccion').classList.remove('activa');
    document.getElementById('pantalla-control').classList.add('activa');
    document.getElementById('titulo-control').innerText = "Conectando al " + nombre + "...";

    // Colorear el control según el robot
    const pad = document.getElementById('pad-direccional');
    pad.className = "contenedor-controles " + (nombre === 'Robot_Rojo' ? 'control-rojo' : 'control-azul');

    try {
        // Buscar el dispositivo Bluetooth por nombre
        dispositivoBluetooth = await navigator.bluetooth.requestDevice({
            filters: [{ name: nombre }],
            optionalServices: [SERVICE_UUID]
        });

        const servidor = await dispositivoBluetooth.gatt.connect();
        const servicio = await servidor.getPrimaryService(SERVICE_UUID);
        caracteristicaBluetooth = await servicio.getCharacteristic(CHARACTERISTIC_UUID);

        document.getElementById('titulo-control').innerText = "¡Conectado al " + nombre + "!";
        console.log("Bluetooth Listo.");

    } catch (error) {
        console.error("Error:", error);
        alert("Error de conexión. Asegúrate de usar Chrome (Android) o Bluefy (iOS).");
        desconectarYVolver();
    }
}

/**
 * Envía una letra al Arduino (C++)
 */
async function enviarLetra(letra) {
    if (caracteristicaBluetooth) {
        try {
            let encoder = new TextEncoder();
            await caracteristicaBluetooth.writeValue(encoder.encode(letra));
            console.log("Enviado: " + letra);
        } catch (error) {
            console.log("Error al enviar: " + error);
        }
    }
}

/**
 * Corta la conexión y regresa al menú
 */
function desconectarYVolver() {
    if (dispositivoBluetooth && dispositivoBluetooth.gatt.connected) {
        dispositivoBluetooth.gatt.disconnect();
    }
    document.getElementById('pantalla-control').classList.remove('activa');
    document.getElementById('pantalla-seleccion').classList.add('activa');
}
