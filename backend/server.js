const app = require('./src/app');
const sequelize = require('./src/config/database');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

async function main() {
    try {
        await sequelize.authenticate();
        console.log('Base de datos conectada con éxito.');

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
}

main();