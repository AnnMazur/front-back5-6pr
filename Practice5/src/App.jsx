import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchProducts,
  addProduct,
  deleteProduct,
  updateProduct,
} from "./features/productsSlice";


function App() {
  console.log("Компонент App рендерится");
  const dispatch = useDispatch();
  const {
    items: products,
    status,
    error,
  } = useSelector((state) => state.products);

  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductDescription, setNewProductDescription] = useState("");
  const [newProductCategories, setNewProductCategories] = useState("");
  const [editProduct, setEditProduct] = useState(null);

  const theme = useSelector((state) => state.theme.mode);
  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  useEffect(() => {
    console.log("UseEffect запустился");
    console.log("Запрашиваем товары с сервера...");
    dispatch(fetchProducts())
      .then((res) => {
        console.log("Ответ от сервера", res);
      })
      .catch((err) => {
        console.error("Ошибка при загрузке товаров", err);
      });
  }, [dispatch]);

  // Функция добавления товара
  const handleAddProduct = () => {
    if (
      !newProductName.trim() ||
      !newProductPrice.trim() ||
      !newProductCategories.trim()
    )
      return;

    const newProduct = {
      id: Date.now().toString(),
      name: newProductName,
      price: parseFloat(newProductPrice), // Преобразуем строку в число
      description: newProductDescription,
      categories: newProductCategories
        .split(",")
        .map((category) => category.trim()), // Разделение категорий по запятой
    };

    dispatch(addProduct(newProduct));
    setNewProductName("");
    setNewProductPrice("");
    setNewProductDescription("");
    setNewProductCategories("");
  };

  // Функция для начала редактирования
  const handleEditClick = (product) => {
    setEditProduct(product);
  };

  // Функция для сохранения изменений
  const handleSaveEdit = () => {
    if (editProduct) {
      dispatch(updateProduct(editProduct));
      setEditProduct(null);
    }
  };

  // Функция удаления товара
  const handleDeleteProduct = (id) => {
    dispatch(deleteProduct(id));
  };

  return (
      <div className={theme}>
      <button onClick={handleToggleTheme}>
      {theme === "light" ? "Тёмная тема" : "Светлая тема"}
      </button>

      <h1>Список товаров</h1>

      {/* Форма для добавления товара */}
      <div class="productForm">
        <input
          type="text"
          value={newProductName}
          onChange={(e) => setNewProductName(e.target.value)}
          placeholder="Название товара"
        />
        <input
          type="number"
          value={newProductPrice}
          onChange={(e) => setNewProductPrice(e.target.value)}
          placeholder="Цена"
        />
        <textarea
          value={newProductDescription}
          onChange={(e) => setNewProductDescription(e.target.value)}
          placeholder="Описание"
        />
        <input
          type="text"
          value={newProductCategories}
          onChange={(e) => setNewProductCategories(e.target.value)}
          placeholder="Категории товара"
        />
        <button onClick={handleAddProduct}>Добавить</button>
      </div>

      {/* Форма редактирования товара */}
      {editProduct && (
        <div class="productForm">
          <h3>Редактирование товара</h3>
          <input
            type="text"
            value={editProduct.name}
            onChange={(e) =>
              setEditProduct({ ...editProduct, name: e.target.value })
            }
          />
          <input
            type="number"
            value={editProduct.price}
            onChange={(e) =>
              setEditProduct({ ...editProduct, price: Number(e.target.value) })
            }
          />
          <textarea
            value={editProduct.description}
            onChange={(e) =>
              setEditProduct({ ...editProduct, description: e.target.value })
            }
          />
          <input
            type="text"
            value={editProduct.categories.join(", ")}
            onChange={(e) =>
              setEditProduct({
                ...editProduct,
                categories: e.target.value.split(",").map((cat) => cat.trim()),
              })
            }
          />
          <button onClick={handleSaveEdit}>Сохранить</button>
          <button onClick={() => setEditProduct(null)}>Отмена</button>
        </div>
      )}

      {/* Статусы загрузки */}
      {status === "loading" && <p>Загрузка товаров...</p>}
      {status === "failed" && <p>Ошибка: {error}</p>}

      {/* Список товаров */}
      <div class="productList">
        {products.map((product) => (
          <div class="product" key={product.id}>
            {product.name} - {product.price} ₽<p>{product.description}</p>
            <p>Категории: {product.categories.join(", ")}</p>
            <button onClick={() => handleEditClick(product)}>
              Редактировать
            </button>
            <button onClick={() => handleDeleteProduct(product.id)}>
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
