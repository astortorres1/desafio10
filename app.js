const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const exphbs = require('express-handlebars').create({});
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Configurar Handlebars como motor de plantillas
app.engine('handlebars', exphbs.engine);
app.set('view engine', 'handlebars');

// Lista de productos (simulada)
let productList = [];

// Cargar productos desde el sistema de archivos al iniciar la aplicación
fs.readFile('products.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error al cargar productos:', err);
        return;
    }
    try {
        productList = JSON.parse(data);
    } catch (parseError) {
        console.error('Error al analizar el archivo de productos:', parseError);
    }
});

// Definir rutas de la API
app.post('/api/products/create', (req, res) => {
    const productName = req.body.name;
    productList.push(productName);
    fs.writeFile('products.json', JSON.stringify(productList), (err) => {
        if (err) {
            console.error('Error al guardar producto:', err);
            return;
        }
        io.emit('productCreated', { name: productName });
        res.send('Producto creado exitosamente.');
    });
});

app.delete('/api/products/delete/:id', (req, res) => {
    const productId = req.params.id;
    const index = productList.indexOf(productId);
    if (index !== -1) {
        productList.splice(index, 1);
        fs.writeFile('products.json', JSON.stringify(productList), (err) => {
            if (err) {
                console.error('Error al eliminar producto:', err);
                return;
            }
            io.emit('productDeleted', productId);
            res.send('Producto eliminado exitosamente.');
        });
    } else {
        res.status(404).send('Producto no encontrado.');
    }
});

// Definir rutas de las vistas
app.get('/', (req, res) => {
    res.render('home', { products: productList });
});

app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { products: productList });
});

// Manejar conexiones de socket.io
io.on('connection', (socket) => {
    console.log('Usuario conectado');

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
