const express = require("express"); //для создания сервера
const bodyParser = require("body-parser"); //для парсинга запросов
const path = require("path"); //для работы с путями файлов
const fs = require("fs"); //для работы с файловой системой

const app = express();
const PORT = 3000;

const swaggerJsDoc = require("swagger-jsdoc"); //для генерации документации api
const swaggerUi = require("swagger-ui-express");
const dataFilePath = path.join(__dirname, "./products.json");

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
  apis: ["openapi.yaml"], //путь к файлам с аннотациями
};

const swaggerDocs = swaggerJsDoc(swaggerOptions); //http://localhost:3000/api-docs - для просмотра свагера
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware для парсинга JSON
app.use(bodyParser.json());

// Функция для чтения данных из JSON
const readData = () => {
  try {
    const data = fs.readFileSync(dataFilePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return []; // Если файла нет, возвращаем пустой массив
  }
};

// Функция для записи данных в JSON
const writeData = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf8");
};

app.use(express.static(path.join(__dirname, "../Practice5")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Practice5/index.html")); //отправка файла index Для основного интерфейса
});

app.get("/admin", (req, res) => {
  //отпрака 404 в файл админа
  res.status(404).sendFile(path.join(__dirname, "admin.html"));
});

// Работа с товарами
let products = readData(); //получение данных из json
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
  writeData(products);
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
//обновить товар
app.put("/products/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find((p) => p.id === productId);
  if (product) {
    product.name = req.body.name !== undefined ? req.body.name : product.name; //если в запросе передано новое имя товара, и оно не пустое, то имя будет обновлено
    product.price =
      req.body.price !== undefined ? req.body.price : product.price;
    product.category =
      req.body.category !== undefined ? req.body.category : product.category;
    writeData(products); // Сохраняем изменения в JSON
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
    writeData(products); // Сохраняем изменения в JSON
    res.status(204).send(); //код 204 указывает на то, что запрос был успешным, но в ответе нет контента
  } else {
    res.status(404).json({ message: "Продукт не найден" });
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
