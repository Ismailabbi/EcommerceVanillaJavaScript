//variables
const marketPlaceIcone = document.querySelector(".MarketPlaceIcone");
const overlay = document.querySelector(".cart-overlay");
const closeButton = document.querySelector(".close-cart");
const cartDom = document.querySelector(".cart");
const productsContainer = document.querySelector(".productsContainer");
const cartsItems = document.querySelector(".cart-items");
const cartTotals = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const clearButton = document.querySelector(".clear-cart");

let carts = [];
let bagButtons = [];
let activBagButtons = [];
class Products {
  async getProducts() {
    try {
      let result = await fetch("./data/products.json");
      let data = await result.json();
      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {}
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProductById(id) {
    const products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id == id);
  }
  static saveCarts(carts) {
    localStorage.setItem("carts", JSON.stringify(carts));
  }
  static getCarts() {
    return localStorage.getItem("carts")
      ? JSON.parse(localStorage.getItem("carts"))
      : [];
  }
}

class Ui {
  setUpApplication() {
    carts = Storage.getCarts();
    this.setCartValue(carts);
    this.populateCart(carts);
    closeButton.addEventListener("click", this.hideOverlay);
    marketPlaceIcone.addEventListener("click", this.showOverlay);
  }
  populateCart(carts) {
    carts.forEach((item) => this.addCartItem(item));
  }

  hideOverlay() {
    overlay.classList.remove("transparentBcg");
    cartDom.classList.remove("showCart");
  }
  showOverlay() {
    overlay.classList.add("transparentBcg");
    cartDom.classList.add("showCart");
  }
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `<article class="product">
          <div class="img-container"><img src=${product.image} />
              <button class="bag-btn" data-id=${product.id}>
                  <i class="fas fa-shopping-cart"> add to bag</i>
              </button>
          </div>
          <div class="priceContainer">
              <h4 class="productName">${product.title}</h4>
              <span class="productPrice">${product.price}</span>
          </div>

      </article>`;
    });
    productsContainer.innerHTML = result;
  }
  getBagbuttons() {
    bagButtons = [...document.querySelectorAll(".bag-btn")];
    bagButtons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = carts.find((cart) => cart.id == id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      } else {
        this.activeButton(button,id)
      }
    });
  }
  activeButton(button,id) {
    button.addEventListener("click", () => {
      activBagButtons.push(button);
      button.innerText = "In Cart";
      button.disabled = true;
      const cartItem = { ...Storage.getProductById(id), amount: 1 };
      carts = [...carts, cartItem];
      Storage.saveCarts(carts);
      this.setCartValue(carts);
      this.addCartItem(cartItem);
      this.showOverlay();
    });
  }
  setCartValue(carts) {
    let totalProducts = 0;
    let totalPricePdoructs = 0;
    carts.map((cart) => {
      totalProducts += cart.amount;
      totalPricePdoructs += cart.price * cart.amount;
    });
    cartsItems.innerHTML = totalProducts;
    cartTotals.innerHTML = totalPricePdoructs.toFixed(2);
  }

  addCartItem(cart) {
    const divContent = document.createElement("div");
    divContent.classList.add("cart-item");
    divContent.innerHTML = `<img class="cart-flex" src=${cart.image} alt="product" />
   <div class=" cart-flex cart-flex-center">
       <h4>${cart.title}</h4>
       <h5>${cart.price}</h5>
       <span class="remove-item" data-id=${cart.id}>remove</span>
   </div>
   <div>
       <i class="fas fa-chevron-up" data-id=${cart.id}></i>
       <p class="item-amount">${cart.amount}</p>
       <i class="fas fa-chevron-down" data-id=${cart.id}></i>
   </div>`;
    cartContent.appendChild(divContent);
  }

  cartEvents() {
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        const tag = event.target;
        const id = tag.dataset.id;
        tag.parentElement.parentElement.remove();
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        const tag = event.target;
        const id = tag.dataset.id;
        let cart = carts.find((cart) => (cart.id = id));
        cart.amount += 1;
        Storage.saveCarts(carts);
        tag.nextElementSibling.innerHTML = cart.amount;
        this.setCartValue(carts);
      } else if (event.target.classList.contains("fa-chevron-down")) {
        const tag = event.target;
        const id = tag.dataset.id;
        let cart = carts.find((cart) => cart.id === id);
        if (cart.amount - 1 <= 0) {
          this.removeItem(id);
          tag.parentElement.parentElement.remove();
          //this.populateCart(carts);
        } else {
          cart.amount = cart.amount -1;
        }
        Storage.saveCarts(carts);
        tag.previousElementSibling.innerHTML = cart.amount;
        this.setCartValue(carts);
      }
    });
    clearButton.addEventListener("click", () => {
      this.clearCart();
    });
  }

  getSingleButton(id) {
    return bagButtons.find((button) => button.dataset.id === id);
  }

  removeItem(id) {
    carts = carts.filter((item) => item.id != id);
    this.setCartValue(carts);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-shopping-cart"> add to bag</i>';
    const buttonExist = activBagButtons.find((item) => (item = button));
    if (!buttonExist) {
      this.activeButton(button,id);
    }
    Storage.saveCarts(carts)
  }

  clearCart() {
    let cartItems = carts.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideOverlay();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new Ui();
  const products = new Products();
  ui.setUpApplication();
  products
    .getProducts()
    .then((products) => {
      Storage.saveProducts(products);
      ui.displayProducts(products);
    })
    .then(() => {
      ui.getBagbuttons();
      ui.cartEvents();
    });
});
