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
  const [editProduct, setEditProduct] = useState(null);
  useEffect(() => {
    //dispatch(fetchProducts()); // Загружаем товары при запуске
    // }, [dispatch]);
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
    if (!newProductName.trim()) return;
    const newProduct = {
      id: Date.now().toString(),
      name: newProductName,
      price: Math.floor(Math.random() * 100000), // Случайная цена
    };
    dispatch(addProduct(newProduct));
    setNewProductName(""); // Очищаем поле
  };
  //ф-ция для начала редактирования
  const handleEditClick = (product) => {
    setEditProduct(product);
  };
  //Функция для сохранения изменений:
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
    <div>
      <h1>Список товаров</h1>
      {/* Форма для добавления товара */}
      <input
        type="text"
        value={newProductName}
        onChange={(e) => setNewProductName(e.target.value)}
        placeholder="Введите название товара"
      />
      <button onClick={handleAddProduct}>Добавить</button>
      {/* Форма редактирования товара */}
      {editProduct && (
        <div>
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
          <button onClick={handleSaveEdit}>Сохранить</button>
          <button onClick={() => setEditProduct(null)}>Отмена</button>
        </div>
      )}
      <button onClick={() => handleEditClick(product)}>Редактировать</button>

      {/* Статусы загрузки */}
      {status === "loading" && <p>Загрузка товаров...</p>}
      {status === "failed" && <p>Ошибка: {error}</p>}
      {/* Список товаров */}
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} - {product.price} ₽
            <button onClick={() => handleDeleteProduct(product.id)}>
              Удалить
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default App;
