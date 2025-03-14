const { ApolloServer, gql } = require('apollo-server-express'); // Для GraphQL
const express = require("express"); // Для создания сервера
const bodyParser = require("body-parser"); // Для парсинга запросов
const path = require("path"); // Для работы с путями файлов
const fs = require("fs"); // Для работы с файловой системой
const WebSocket = require('ws'); // Подключаем WebSocket


const app = express();
// Чтение данных из JSON
const loadProducts = () => {
  try {
    const data = fs.readFileSync(dataFilePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return []; // Если файла нет, возвращаем пустой массив
  }
};

// Запись данных в JSON
const saveProducts = (data) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Ошибка при сохранении: ", error);
  }
};

// Определение схемы GraphQL
const typeDefs = gql`
  type Product {
    id: ID!
    name: String!
    price: Float!
    description: String
    categories: [String]
  }

  type Query {
    products: [Product]
    product(id: ID!): Product
  }
`;

const resolvers = {
  Query: {
    products: () => loadProducts(),
    product: (_, { id }) => loadProducts().find(p => p.id == id),
  }
};

const PORT = 3000;

const swaggerJsDoc = require("swagger-jsdoc"); // Для генерации документации API
const swaggerUi = require("swagger-ui-express");
const dataFilePath = path.join(__dirname, "./products.json");

// Middleware для парсинга JSON
app.use(bodyParser.json());

// Создаём сервер ApolloServer с указанными схемами и резолверами
const server = new ApolloServer({ typeDefs, resolvers });

async function startServer() {
  await server.start(); // Дожидаемся, пока Apollo Server начнёт работу
  server.applyMiddleware({ app });

  // Swagger документация
  const swaggerOptions = {
    swaggerDefinition: {
      openapi: "3.0.0",
      info: {
        title: "Task Management API",
        version: "1.0.0",
        description: "API для управления задачами",
      },
      servers: [
        {
          url: "http://localhost:3000",
        },
      ],
    },
    apis: ["openapi.yaml"], // Путь к API аннотациям
  };

  const swaggerDocs = swaggerJsDoc(swaggerOptions); // http://localhost:3000/api-docs для просмотра Swagger
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  // Работа с товарами
  let products = loadProducts(); // Получение данных из JSON
  app.get("/products", (req, res) => {
    res.json(products);
  });

  app.post("/products", (req, res) => {
    const newProduct = {
      id: products.length > 0 ? products[products.length - 1].id + 1 : 1,
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      categories: req.body.categories,
    };
    products.push(newProduct);
    saveProducts(products);
    res.status(201).json(newProduct);
  });

  // Получение товара по ID
  app.get("/products/:id", (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find((p) => p.id === productId);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Продукт не найден" });
    }
  });

  // Обновить товар
  app.put("/products/:id", (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find((p) => p.id === productId);
    if (product) {
      product.name = req.body.name !== undefined ? req.body.name : product.name;
      product.price =
        req.body.price !== undefined ? req.body.price : product.price;
      product.categories =
        req.body.categories !== undefined ? req.body.categories : product.categories;
      saveProducts(products); // Сохраняем изменения в JSON
      res.json(product);
    } else {
      res.status(404).json({ message: "Продукт не найден" });
    }
  });

  // Удаление товара
  app.delete("/products/:id", (req, res) => {
    const productId = parseInt(req.params.id);
    const newProducts = products.filter((p) => p.id !== productId);
    if (newProducts.length !== products.length) {
      products = newProducts;
      saveProducts(products); // Сохраняем изменения в JSON
      res.status(204).send(); // Код 204 указывает на успешный запрос без контента
    } else {
      res.status(404).json({ message: "Продукт не найден" });
    }
  });

  app.use(express.static(path.join(__dirname, "../Practice5")));
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../Practice5/index.html")); // Отправка файла index для основного интерфейса
  });

  app.get("/admin", (req, res) => {
    res.status(404).sendFile(path.join(__dirname, "admin.html"));
  });

  // Запуск сервера
  app.listen(PORT, () => {
    console.log(`GraphQL API запущен на http://localhost:${PORT}/graphql`);
    console.log(`Swagger API Docs: http://localhost:${PORT}/api-docs`);
  });

  const wss = new WebSocket.Server({ port: 8080 }); // WebSocket-сервер на порту 8080

wss.on('connection', (ws) => {
    console.log('Новое подключение к WebSocket серверу');

    ws.on('message', (message) => {
      console.log('Сообщение получено:', message.toString());
  
      // Отправляем сообщение всем клиентам в формате JSON
      wss.clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ text: message.toString() })); // Отправляем JSON
          }
      });
  });
  

    ws.on('close', () => {
        console.log('Клиент отключился');
    });
});

console.log('WebSocket сервер запущен на ws://localhost:8080');
}

// Запуск сервера
startServer();


