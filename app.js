// app.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const exphbs = require('express-handlebars');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Configurar Handlebars como motor de plantillas
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Lista de productos (simulada)
const productList = ['Producto 1', 'Producto 2', 'Producto 3'];

// Definir rutas
app.get('/', (req, res) => {
    res.render('home', { products: productList });
});

app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { products: productList });
});

// Manejar conexiones de socket.io
io.on('connection', (socket) => {
    console.log('Usuario conectado');

    // Manejar eventos de creación y eliminación de productos
    socket.on('createProduct', (product) => {
        // Lógica para agregar el producto a la lista
        productList.push(product.name);
        io.emit('productCreated', product);
    });

    socket.on('deleteProduct', (productId) => {
        // Lógica para eliminar el producto de la lista
        const index = productList.indexOf(productId);
        if (index !== -1) {
            productList.splice(index, 1);
            io.emit('productDeleted', productId);
        }
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
