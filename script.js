// 節點///////////////////////////////////////////////
const menu = document.getElementById('menu')
const cart = document.getElementById('cart')
const totalAmount = document.getElementById('total-amount')
const submitButton = document.getElementById('submit-button')
const receipt = document.querySelector('#receipt-modal-content')
const receiptBody = document.querySelector('#receipt-modal-content-body')

// 變數命名////////////////////////////////////////////
const productData = [];
let cartItems = []
let total = 0

// 函式區域////////////////////////////////////////////
// 此函式可以渲染菜單
function displayProduct(products) {
  products.forEach(product => menu.innerHTML += `
    <div class="col-3">
       <div class="card">
          <img src=${product.imgUrl} class="card-img-top" alt="...">
          <div class="card-body">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text">${product.price}</p>
            <a class="btn btn-primary btn-add-to-cart" data-id="${product.id}">加入購物車</a>
          </div>
        </div>
      </div>
  `)
}

// 此函式可以將cartItems的內容render到cart節點
function displayCartItems(arr) {
  cart.innerHTML = arr.map(item => `
    <li class="list-group-item">
      <div class="row">
        <div class="col-sm-8 d-flex align-items-center">
          <span>${item.name} X ${item.quantity} 小計：${item.price * item.quantity}</span>
        </div>
        <div class="col-sm-4 d-flex justify-content-end">
          <a class="btn btn-outline-secondary btn-plus" data-id="${item.id}"><i class="fa-solid fa-plus btn-plus" data-id="${item.id}"></i></a>
          <a class="btn btn-outline-secondary btn-minus" data-id="${item.id}"><i class="fa-solid fa-minus btn-minus" data-id="${item.id}"></i></a>
        </div>
      </div>
    </li>`).join('')
}

// 按「加入購物車」會執行的事情
function addToCart(event) {
  // 找到觸發event的node元素，並藉由dataset得到其產品id
  const id = event.target.dataset.id
  // 在productData的資料裡，找到點擊的產品資訊，加入 cartItems
  const addedProduct = productData.find(product => product.id === id)
  const name = addedProduct.name
  const price = addedProduct.price
  // 加入購物車變數cartItems 分：有按過、沒按過
  const targetItem = cartItems.find(item => item.id === id)

  if (targetItem) {
    targetItem.quantity += 1
    /**
    * targetItem賦值的方式算是一種shallow copy。
    * 所以我們可以透過修改targetItem內的值，同時去修改cartItem內對應的key的值的效果。
    */
  } else {
    cartItems.push({
      id, // id: id,
      name, // name: name,
      price, // price: price,
      quantity: 1,
    })
    /**
    * 上面是用ES6以後可以用的Object shorthand
    */
  }

  displayCartItems(cartItems)
  displaySubmitButton(cartItems)
  addTotal(price)
}

// 此函式可以渲染總金額，執行有關加的事情
function addTotal(amount) {
  total += amount
  totalAmount.textContent = total
}

// 此函式可以渲染總金額，執行有關減的事情
function minusTotal(amount) {
  total -= amount
  totalAmount.textContent = total
}

// 此函式可以在按下「送出訂單」後渲染收據
function displayReceiptBody(arr) {
  // console.log(event)
  /** 
  * 我想要顯示一個訊息，有點像是購買明細，告知使用者這次購買了什麼，有小計，還有總額
  * 這個顯示訊息用modal來做
  * 這個訊息顯示的資料來源一樣用cartItem裡面的
  * 這個modal內有一個按鈕，按下去代表使用者確認了本次的購買細節，同時，這個按鈕會導回一個新的購買頁面（重新整理），但因為重新整理的功能用codepen做不出來，所以這個按鈕按下去就會把cartItem清空。
  */
  let rawHTML = '感謝購買<br>'

  rawHTML += arr.map(item => `${item.name} X ${item.quantity} 小計：${item.price * item.quantity}<br>`).join('')
  rawHTML += `共<mark>${total}</mark>元`
  // console.log(rawHTML)

  receiptBody.innerHTML = rawHTML
}

// 此函式可以根據cartItems內有無資料來開or關「送出訂單」按鈕
function displaySubmitButton(arr) {
  if (arr.length && submitButton.classList.contains('disabled')) {
    submitButton.classList.toggle('disabled')
  } else if (!arr.length && !submitButton.classList.contains('disabled')) {
    submitButton.classList.toggle('disabled')
  } else {
    return
  }
}

// 此函式可以重製購買資料，就是cartItems
function reset(arr) {
  arr.splice(arr[0], arr.length)

  displayCartItems(arr)
  displaySubmitButton(arr)

  total = 0
  totalAmount.textContent = total
}

// 事件監聽器區域///////////////////////////////////////
menu.addEventListener('click', function onMenuClicked(event) {
  if (event.target.matches('.btn-add-to-cart')) {
    addToCart(event)
  }
})

submitButton.addEventListener('click', function onSubmitButtonClicked(event) {
  displayReceiptBody(cartItems)
})

cart.addEventListener('click', function onCartClicked(event) {
  if (event.target.matches('.btn-plus')) {
    addToCart(event)
  } else if (event.target.matches('.btn-minus')) {
    const id = event.target.dataset.id
    const selectedCartItem = cartItems.find(item => item.id === id)

    if (selectedCartItem.quantity > 1) {
      selectedCartItem.quantity -= 1
    } else if (selectedCartItem.quantity === 1) {
      const selectedIndex = cartItems.findIndex(item => item.id === id)
      cartItems.splice(selectedIndex, 1)
    } else {
      return alert('something went wrong')
    }

    displayCartItems(cartItems)
    displaySubmitButton(cartItems)
    minusTotal(selectedCartItem.price)
  }
})

receipt.addEventListener('click', function onReceiptClicked(event) {
  if (event.target.id === 'btn-looks-fine') {
    reset(cartItems)
  }
})

// GET API 菜單產品資料
axios.get('https://ac-w3-dom-pos.firebaseio.com/products.json')
  .then(function (res) {
    productData.push(...res.data)
    displayProduct(productData)
  })