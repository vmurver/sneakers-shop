// ============================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================
let currentUser = null;
let currentProductForCart = null;
let allProducts = [];

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Страница загружена');
    
    await checkAuth();
    await loadCartCount();
    setupAuthListeners();
    await loadPageContent();
    setupAddressAutocomplete(); // Добавляем автодополнение адреса
});

// Загрузка контента страницы
async function loadPageContent() {
    const path = window.location.pathname;
    
    if (path === '/catalog') {
        await loadCatalog();
    } else if (path === '/') {
        await loadPopularProducts();
    } else if (path === '/cart') {
        await loadCart();
    } else if (path === '/checkout') {
        await loadCheckout();
    } else if (path === '/profile') {
        await loadProfile();
    } else if (path === '/orders') {
        await loadOrders();
    } else if (path === '/statistics') {
        await loadStatistics();
    } else if (path.startsWith('/product/')) {
        await loadProductDetails();
    }
}

// ============================================
// АВТОЗАПОЛНЕНИЕ АДРЕСА
// ============================================
function setupAddressAutocomplete() {
    const addressInput = document.getElementById('deliveryAddress');
    if (!addressInput) return;
    
    // Список городов России для автодополнения
    const cities = [
        'г. Москва', 'г. Санкт-Петербург', 'г. Новосибирск', 'г. Екатеринбург', 
        'г. Казань', 'г. Нижний Новгород', 'г. Челябинск', 'г. Самара', 
        'г. Омск', 'г. Ростов-на-Дону', 'г. Уфа', 'г. Красноярск', 
        'г. Пермь', 'г. Воронеж', 'г. Волгоград', 'г. Краснодар',
        'г. Саратов', 'г. Тюмень', 'г. Тольятти', 'г. Ижевск', 'г. Барнаул'
    ];
    
    // Создаем datalist для автодополнения
    let datalist = document.getElementById('citySuggestions');
    if (!datalist) {
        datalist = document.createElement('datalist');
        datalist.id = 'citySuggestions';
        document.body.appendChild(datalist);
    }
    
    // Заполняем города
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        datalist.appendChild(option);
    });
    
    // Добавляем атрибут list к полю ввода
    addressInput.setAttribute('list', 'citySuggestions');
    
    // Добавляем обработчик для форматирования адреса
    addressInput.addEventListener('blur', function() {
        let address = this.value.trim();
        if (address && !address.includes('ул.') && !address.includes('улица')) {
            this.placeholder = 'Пример: г. Москва, ул. Тверская, д. 1, кв. 10';
        }
    });
    
    // Добавляем подсказку
    addressInput.placeholder = 'Начните вводить город...';
}

// Форматирование адреса
function formatAddress(address) {
    if (!address) return '';
    
    // Проверяем наличие города
    const hasCity = /г\.|город|поселок|деревня/i.test(address);
    if (!hasCity && address.length > 0) {
        return 'г. ' + address;
    }
    return address;
}

// ============================================
// АВТОРИЗАЦИЯ
// ============================================
async function checkAuth() {
    try {
        const response = await fetch('/api/user');
        if (response.ok) {
            currentUser = await response.json();
            updateUIForLoggedInUser();
            return true;
        } else {
            updateUIForLoggedOutUser();
            return false;
        }
    } catch (error) {
        console.error('Ошибка:', error);
        updateUIForLoggedOutUser();
        return false;
    }
}

function updateUIForLoggedInUser() {
    const profileLink = document.getElementById('profileLink');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (profileLink) profileLink.style.display = 'block';
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'block';
}

function updateUIForLoggedOutUser() {
    const profileLink = document.getElementById('profileLink');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (profileLink) profileLink.style.display = 'none';
    if (loginBtn) loginBtn.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'none';
}

function setupAuthListeners() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (loginBtn) {
        loginBtn.onclick = (e) => {
            e.preventDefault();
            showLoginModal();
        };
    }
    
    if (logoutBtn) {
        logoutBtn.onclick = async (e) => {
            e.preventDefault();
            await fetch('/api/logout', { method: 'POST' });
            currentUser = null;
            updateUIForLoggedOutUser();
            await loadCartCount();
            location.reload();
        };
    }
    
    // Форма входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.onsubmit = login;
    }
    
    // Форма регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.onsubmit = register;
    }
    
    // Закрытие модальных окон
    document.querySelectorAll('.close').forEach(btn => {
        btn.onclick = () => {
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('registerModal').style.display = 'none';
            document.getElementById('sizeModal').style.display = 'none';
        };
    });
    
    // Переключение между модальными окнами
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    
    if (showRegister) {
        showRegister.onclick = (e) => {
            e.preventDefault();
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('registerModal').style.display = 'block';
        };
    }
    
    if (showLogin) {
        showLogin.onclick = (e) => {
            e.preventDefault();
            document.getElementById('registerModal').style.display = 'none';
            document.getElementById('loginModal').style.display = 'block';
        };
    }
    
    // Закрытие по клику вне окна
    window.onclick = (e) => {
        if (e.target === document.getElementById('loginModal')) {
            document.getElementById('loginModal').style.display = 'none';
        }
        if (e.target === document.getElementById('registerModal')) {
            document.getElementById('registerModal').style.display = 'none';
        }
        if (e.target === document.getElementById('sizeModal')) {
            document.getElementById('sizeModal').style.display = 'none';
        }
    };
}

function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'block';
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
    }
}

async function login(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        alert('Заполните все поля');
        return;
    }
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            updateUIForLoggedInUser();
            document.getElementById('loginModal').style.display = 'none';
            await loadCartCount();
            alert('Добро пожаловать, ' + currentUser.fullName + '!');
            location.reload();
        } else {
            const error = await response.json();
            alert(error.error || 'Неверный email или пароль');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при входе');
    }
}

// Регистрация с проверкой данных
async function register(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('regFullName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    let address = document.getElementById('regAddress').value.trim();
    const birthDate = document.getElementById('regBirthDate').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    // Форматируем адрес
    address = formatAddress(address);
    
    // Проверка ФИО
    if (!fullName) {
        alert('Введите ФИО');
        return;
    }
    if (fullName.length < 5) {
        alert('ФИО должно содержать минимум 5 символов');
        return;
    }
    
    // Проверка email
    if (!email) {
        alert('Введите email');
        return;
    }
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Введите корректный email (например: name@domain.com)');
        return;
    }
    
    // Проверка телефона
    if (phone) {
        const phoneRegex = /^[\+\d\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(phone)) {
            alert('Введите корректный номер телефона');
            return;
        }
    }
    
    // Проверка адреса
    if (address) {
        if (address.length < 10) {
            alert('Укажите полный адрес (город, улица, дом)');
            return;
        }
    }
    
    // Проверка пароля
    if (!password) {
        alert('Введите пароль');
        return;
    }
    if (password.length < 4) {
        alert('Пароль должен содержать минимум 4 символа');
        return;
    }
    if (password !== confirmPassword) {
        alert('Пароли не совпадают');
        return;
    }
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, fullName, phone, address, birthDate })
        });
        
        if (response.ok) {
            alert('Регистрация успешна! Войдите в систему.');
            document.getElementById('registerModal').style.display = 'none';
            document.getElementById('loginModal').style.display = 'block';
            document.getElementById('registerForm').reset();
        } else {
            const error = await response.json();
            alert(error.error || 'Ошибка регистрации');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при регистрации');
    }
}

// ============================================
// КОРЗИНА
// ============================================
async function loadCartCount() {
    try {
        const response = await fetch('/api/cart');
        if (response.ok) {
            const data = await response.json();
            const count = document.getElementById('cartCount');
            if (count) count.textContent = data.itemsCount || 0;
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

async function addToCart(productId, quantity, size) {
    try {
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity, size })
        });
        
        if (response.ok) {
            await loadCartCount();
            alert('✅ Товар добавлен в корзину!');
            return true;
        } else {
            const error = await response.json();
            alert(error.error || 'Ошибка добавления');
            return false;
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при добавлении в корзину');
        return false;
    }
}

// Глобальная функция для добавления в корзину (для кнопок)
window.addToCartGlobal = async function(productId) {
    const modal = document.getElementById('sizeModal');
    const sizeSelector = document.getElementById('sizeSelector');
    
    if (!modal || !sizeSelector) return;
    
    const sizes = [38, 39, 40, 41, 42, 43, 44, 45];
    
    sizeSelector.innerHTML = sizes.map(size => `
        <button class="size-btn" data-size="${size}">${size}</button>
    `).join('');
    
    sizeSelector.querySelectorAll('.size-btn').forEach(btn => {
        btn.onclick = () => {
            sizeSelector.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        };
    });
    
    modal.style.display = 'block';
    
    const confirmBtn = document.getElementById('confirmAddToCart');
    confirmBtn.onclick = () => {
        const selected = sizeSelector.querySelector('.size-btn.selected');
        if (selected) {
            addToCart(productId, 1, parseInt(selected.dataset.size));
            modal.style.display = 'none';
        } else {
            alert('Выберите размер');
        }
    };
};

function showSizeSelector(productId) {
    window.addToCartGlobal(productId);
}

async function loadCart() {
    const container = document.querySelector('.cart-items');
    if (!container) return;
    
    try {
        const response = await fetch('/api/cart');
        const data = await response.json();
        const cart = data.items || [];
        
        if (cart.length === 0) {
            container.innerHTML = '<div class="empty-cart"><p>🛒 Корзина пуста</p><a href="/catalog" class="btn-primary">Перейти в каталог</a></div>';
            const summary = document.getElementById('cartSummary');
            if (summary) summary.style.display = 'none';
            return;
        }
        
        const summary = document.getElementById('cartSummary');
        if (summary) summary.style.display = 'block';
        
        container.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image_url || '/images/placeholder.jpg'}" class="cart-item-image" onerror="this.src='/images/placeholder.jpg'">
                <div class="cart-item-info">
                    <h4>${escapeHtml(item.name)}</h4>
                    <p>Бренд: ${escapeHtml(item.brand)}</p>
                    <p>Размер: ${item.size}</p>
                </div>
                <div class="cart-item-price">${item.price.toLocaleString()} ₽</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateCartItem('${item.id}', ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartItem('${item.id}', ${item.quantity + 1})">+</button>
                </div>
                <div class="cart-item-total">${(item.price * item.quantity).toLocaleString()} ₽</div>
                <div class="remove-item" onclick="removeCartItem('${item.id}')">🗑️</div>
            </div>
        `).join('');
        
        const totalEl = document.getElementById('cartTotal');
        if (totalEl) totalEl.textContent = `${data.totalAmount.toLocaleString()} ₽`;
        
    } catch (error) {
        console.error('Ошибка:', error);
        container.innerHTML = '<p class="error">Ошибка загрузки корзины</p>';
    }
}

async function updateCartItem(cartId, newQuantity) {
    if (newQuantity < 1) {
        await removeCartItem(cartId);
        return;
    }
    
    try {
        await fetch(`/api/cart/${cartId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: newQuantity })
        });
        await loadCart();
        await loadCartCount();
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

async function removeCartItem(cartId) {
    try {
        await fetch(`/api/cart/${cartId}`, { method: 'DELETE' });
        await loadCart();
        await loadCartCount();
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// ============================================
// КАТАЛОГ С ФИЛЬТРАЦИЕЙ И СОРТИРОВКОЙ
// ============================================
async function loadCatalog() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    try {
        const response = await fetch('/api/products');
        allProducts = await response.json();
        
        if (allProducts.length === 0) {
            grid.innerHTML = '<p>Нет товаров</p>';
            return;
        }
        
        displayProducts(allProducts);
        setupFiltersAndSort();
        
    } catch (error) {
        console.error('Ошибка:', error);
        grid.innerHTML = '<p class="error">Ошибка загрузки</p>';
    }
}

function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    const resultsCount = document.getElementById('resultsCount');
    
    if (resultsCount) {
        resultsCount.textContent = `Найдено товаров: ${products.length}`;
    }
    
    if (products.length === 0) {
        grid.innerHTML = '<p class="no-products">😕 Товары не найдены</p>';
        return;
    }
    
    grid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image_url || '/images/placeholder.jpg'}" class="product-image" onerror="this.src='/images/placeholder.jpg'">
            <div class="product-info">
                <h3>${escapeHtml(product.name)}</h3>
                <div class="product-brand">${escapeHtml(product.brand)}</div>
                <div class="product-price">${product.price.toLocaleString()} ₽</div>
                <div class="product-rating">★ ${product.rating}</div>
                <div class="product-actions">
                    <button onclick="window.addToCartGlobal(${product.id})" class="btn-cart">В корзину</button>
                    <a href="/product/${product.id}" class="btn-view">Подробнее</a>
                </div>
            </div>
        </div>
    `).join('');
}

function setupFiltersAndSort() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.oninput = () => filterAndSortProducts();
    }
    
    const brandFilter = document.getElementById('brandFilter');
    if (brandFilter) {
        brandFilter.onchange = () => filterAndSortProducts();
    }
    
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.onchange = () => filterAndSortProducts();
    }
    
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    if (minPrice) minPrice.oninput = () => filterAndSortProducts();
    if (maxPrice) maxPrice.oninput = () => filterAndSortProducts();
    
    document.querySelectorAll('.size-checkbox input').forEach(checkbox => {
        checkbox.onchange = () => filterAndSortProducts();
    });
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.onchange = () => filterAndSortProducts();
    }
    
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
        resetBtn.onclick = () => resetAllFilters();
    }
}

function filterAndSortProducts() {
    let filtered = [...allProducts];
    
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    if (search) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(search));
    }
    
    const brand = document.getElementById('brandFilter')?.value;
    if (brand && brand !== '') {
        filtered = filtered.filter(p => p.brand === brand);
    }
    
    const category = document.getElementById('categoryFilter')?.value;
    if (category && category !== '') {
        filtered = filtered.filter(p => p.category === category);
    }
    
    const minPrice = parseFloat(document.getElementById('minPrice')?.value);
    const maxPrice = parseFloat(document.getElementById('maxPrice')?.value);
    if (minPrice) filtered = filtered.filter(p => p.price >= minPrice);
    if (maxPrice) filtered = filtered.filter(p => p.price <= maxPrice);
    
    const selectedSizes = Array.from(document.querySelectorAll('.size-checkbox input:checked')).map(cb => parseInt(cb.value));
    if (selectedSizes.length > 0) {
        filtered = filtered.filter(product => 
            product.size && product.size.some(size => selectedSizes.includes(size))
        );
    }
    
    const sort = document.getElementById('sortSelect')?.value;
    if (sort && sort !== 'default') {
        switch(sort) {
            case 'price_asc': filtered.sort((a, b) => a.price - b.price); break;
            case 'price_desc': filtered.sort((a, b) => b.price - a.price); break;
            case 'name_asc': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'rating_desc': filtered.sort((a, b) => b.rating - a.rating); break;
        }
    }
    
    displayProducts(filtered);
}

function resetAllFilters() {
    const searchInput = document.getElementById('searchInput');
    const brandFilter = document.getElementById('brandFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    const sortSelect = document.getElementById('sortSelect');
    
    if (searchInput) searchInput.value = '';
    if (brandFilter) brandFilter.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (minPrice) minPrice.value = '';
    if (maxPrice) maxPrice.value = '';
    if (sortSelect) sortSelect.value = 'default';
    
    document.querySelectorAll('.size-checkbox input').forEach(cb => cb.checked = false);
    
    displayProducts(allProducts);
}

// ============================================
// ГЛАВНАЯ СТРАНИЦА
// ============================================
async function loadPopularProducts() {
    const grid = document.getElementById('popularProducts');
    if (!grid) return;
    
    try {
        const response = await fetch('/api/products?limit=4&sort=rating_desc');
        const products = await response.json();
        
        grid.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image_url || '/images/placeholder.jpg'}" class="product-image" onerror="this.src='/images/placeholder.jpg'">
                <div class="product-info">
                    <h3>${escapeHtml(product.name)}</h3>
                    <div class="product-brand">${escapeHtml(product.brand)}</div>
                    <div class="product-price">${product.price.toLocaleString()} ₽</div>
                    <div class="product-rating">★ ${product.rating}</div>
                    <div class="product-actions">
                        <button onclick="window.addToCartGlobal(${product.id})" class="btn-cart">В корзину</button>
                        <a href="/product/${product.id}" class="btn-view">Подробнее</a>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Ошибка:', error);
        grid.innerHTML = '<p class="error">Ошибка загрузки</p>';
    }
}

// ============================================
// СТРАНИЦА ТОВАРА
// ============================================
async function loadProductDetails() {
    const productId = window.location.pathname.split('/').pop();
    const container = document.getElementById('productDetail');
    if (!container) return;
    
    try {
        const response = await fetch(`/api/products/${productId}`);
        const product = await response.json();
        
        container.innerHTML = `
            <div class="product-detail-container">
                <div class="product-detail-image">
                    <img src="${product.image_url || '/images/placeholder.jpg'}" alt="${product.name}">
                </div>
                <div class="product-detail-info">
                    <h1>${escapeHtml(product.name)}</h1>
                    <div class="product-brand">Бренд: ${escapeHtml(product.brand)}</div>
                    <div class="product-rating">★ ${product.rating} / 5</div>
                    <div class="product-price">${product.price.toLocaleString()} ₽</div>
                    <div class="product-availability">${product.stock > 0 ? '✅ В наличии' : '❌ Нет в наличии'}</div>
                    
                    <div class="product-sizes">
                        <h3>Размеры:</h3>
                        <div class="size-selector-grid">
                            ${product.size.map(size => `<button class="size-option" data-size="${size}">${size}</button>`).join('')}
                        </div>
                    </div>
                    
                    <div class="product-description">
                        <h3>Описание:</h3>
                        <p>${escapeHtml(product.description || 'Описание отсутствует')}</p>
                    </div>
                    
                    <button onclick="addToCartFromDetail(${product.id})" class="btn-primary">Добавить в корзину</button>
                </div>
            </div>
        `;
        
        let selectedSize = null;
        document.querySelectorAll('.size-option').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.size-option').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedSize = parseInt(btn.dataset.size);
            };
        });
        
        window.addToCartFromDetail = (productId) => {
            if (!selectedSize) {
                alert('Выберите размер');
                return;
            }
            addToCart(productId, 1, selectedSize);
        };
        
    } catch (error) {
        console.error('Ошибка:', error);
        container.innerHTML = '<p>Товар не найден</p>';
    }
}

// ============================================
// ОФОРМЛЕНИЕ ЗАКАЗА С ПРОВЕРКОЙ И АВТОРИЗАЦИЕЙ
// ============================================
async function loadCheckout() {
    if (!currentUser) {
        alert('Для оформления заказа необходимо войти в систему');
        showLoginModal();
        return false;
    }
    
    const form = document.getElementById('checkoutForm');
    if (form) {
        form.onsubmit = placeOrder;
    }
    
    await loadCheckoutCartItems();
    
    try {
        const response = await fetch('/api/user');
        const user = await response.json();
        if (user.address) {
            const addressField = document.getElementById('deliveryAddress');
            if (addressField) addressField.value = user.address;
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
    
    return true;
}

async function loadCheckoutCartItems() {
    try {
        const response = await fetch('/api/cart');
        const data = await response.json();
        const cart = data.items || [];
        
        const itemsDiv = document.getElementById('checkoutItems');
        if (itemsDiv) {
            if (cart.length === 0) {
                itemsDiv.innerHTML = '<p>Корзина пуста. <a href="/catalog">Перейти в каталог</a></p>';
                document.getElementById('checkoutSubmit').disabled = true;
                return;
            }
            
            itemsDiv.innerHTML = cart.map(item => `
                <div class="order-summary-item">
                    <span>${escapeHtml(item.name)} x ${item.quantity} (${item.size} размер)</span>
                    <span>${(item.price * item.quantity).toLocaleString()} ₽</span>
                </div>
            `).join('');
            document.getElementById('checkoutSubmit').disabled = false;
        }
        
        const totalEl = document.getElementById('checkoutTotal');
        if (totalEl) totalEl.textContent = `${data.totalAmount.toLocaleString()} ₽`;
        
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

async function placeOrder(e) {
    e.preventDefault();
    
    let address = document.getElementById('deliveryAddress').value.trim();
    const deliveryMethod = document.getElementById('deliveryMethod').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    // Форматируем адрес
    address = formatAddress(address);
    
    // Проверка адреса
    if (!address) {
        alert('Введите адрес доставки');
        return;
    }
    if (address.length < 10) {
        alert('Укажите полный адрес доставки (город, улица, дом, квартира)');
        return;
    }
    
    // Проверка наличия города
    const hasCity = /г\.|город|поселок|деревня|село|пгт/i.test(address);
    if (!hasCity) {
        alert('Укажите город в адресе (например: г. Москва, ул. Ленина, д. 1)');
        return;
    }
    
    // Проверка номера дома
    const hasHouse = /\b(д\.|дом|д)\s*\d+|\b\d+\s*(кв|к\.)?/i.test(address);
    if (!hasHouse) {
        alert('Укажите номер дома в адресе');
        return;
    }
    
    if (!deliveryMethod) {
        alert('Выберите способ доставки');
        return;
    }
    
    if (!paymentMethod) {
        alert('Выберите способ оплаты');
        return;
    }
    
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                deliveryAddress: address, 
                deliveryMethod, 
                paymentMethod 
            })
        });
        
        if (response.ok) {
            alert('✅ Заказ успешно оформлен! Спасибо за покупку.');
            window.location.href = '/orders';
        } else {
            const error = await response.json();
            alert(error.error || 'Ошибка оформления заказа');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при оформлении заказа');
    }
}

// ============================================
// ЛИЧНЫЙ КАБИНЕТ
// ============================================
async function loadProfile() {
    if (!currentUser) {
        window.location.href = '/';
        return;
    }
    
    try {
        const response = await fetch('/api/user');
        const user = await response.json();
        
        const infoDiv = document.querySelector('.profile-info');
        if (infoDiv) {
            let addressDisplay = user.address || 'Не указан';
            
            infoDiv.innerHTML = `
                <div class="info-row">
                    <span class="info-label">ФИО:</span>
                    <span>${escapeHtml(user.full_name || 'Не указано')}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span>${escapeHtml(user.email)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Телефон:</span>
                    <span>${escapeHtml(user.phone || 'Не указан')}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Адрес (город, улица, дом):</span>
                    <span>${escapeHtml(addressDisplay)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Дата рождения:</span>
                    <span>${user.birth_date || 'Не указана'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Дата регистрации:</span>
                    <span>${new Date(user.registration_date).toLocaleDateString()}</span>
                </div>
            `;
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// ============================================
// ИСТОРИЯ ЗАКАЗОВ
// ============================================
async function loadOrders() {
    if (!currentUser) {
        window.location.href = '/';
        return;
    }
    
    try {
        const response = await fetch('/api/orders');
        const orders = await response.json();
        
        const container = document.getElementById('ordersList');
        if (!container) return;
        
        if (orders.length === 0) {
            container.innerHTML = '<p>📭 У вас пока нет заказов</p>';
            return;
        }
        
        container.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <strong>Заказ №${order.order_number}</strong>
                        <div>📅 ${new Date(order.created_at).toLocaleString()}</div>
                    </div>
                    <div class="order-status ${order.status}">
                        ${order.status === 'pending' ? '🟡 Ожидает' : '✅ Выполнен'}
                    </div>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span>${escapeHtml(item.product_name)}</span>
                            <span>Размер: ${item.size}</span>
                            <span>${item.quantity} шт</span>
                            <span>${(item.price * item.quantity).toLocaleString()} ₽</span>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">
                    <strong>Итого: ${order.total_amount.toLocaleString()} ₽</strong>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Ошибка:', error);
        container.innerHTML = '<p class="error">Ошибка загрузки заказов</p>';
    }
}
// ============================================
// СТАТИСТИКА ПРОДАЖ С ГРАФИКАМИ (ИСПРАВЛЕННАЯ)
// ============================================

// ============================================
// СТАТИСТИКА ПРОДАЖ С ГРАФИКАМИ (ИСПРАВЛЕННАЯ)
// ============================================

let salesChart = null;
let ordersChart = null;
let categoryChart = null;
let sizeChart = null;

async function loadStatistics() {
    if (!currentUser) {
        window.location.href = '/';
        return;
    }
    
    console.log('Загрузка страницы статистики...');
    
    const periodSelect = document.getElementById('periodSelect');
    const refreshBtn = document.getElementById('refreshStats');
    
    if (refreshBtn) {
        refreshBtn.onclick = () => fetchStatistics();
    }
    if (periodSelect) {
        periodSelect.onchange = () => fetchStatistics();
    }
    
    await fetchStatistics();
}

async function fetchStatistics() {
    const period = document.getElementById('periodSelect')?.value || 'month';
    
    console.log('Запрос статистики за период:', period);
    
    try {
        const response = await fetch(`/api/statistics/sales?period=${period}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const stats = await response.json();
        console.log('Получены данные статистики:', stats);
        
        // Проверяем наличие данных
        if (!stats) {
            console.error('Нет данных от сервера');
            showStatisticsError('Нет данных от сервера');
            return;
        }
        
        // Обновляем ключевые показатели
        updateKeyMetrics(stats.totalStats || {});
        
        // Обновляем графики
        if (stats.salesByDate && stats.salesByDate.length > 0) {
            updateSalesChart(stats.salesByDate);
            updateOrdersChart(stats.salesByDate);
        } else {
            console.log('Нет данных для графиков продаж');
            showEmptyChartMessage('salesChart', 'Нет данных за выбранный период');
            showEmptyChartMessage('ordersChart', 'Нет данных за выбранный период');
        }
        
        if (stats.salesByCategory && stats.salesByCategory.length > 0) {
            updateCategoryChart(stats.salesByCategory);
        } else {
            console.log('Нет данных для графика категорий');
            showEmptyChartMessage('categoryChart', 'Нет данных по категориям');
        }
        
        if (stats.salesBySize && stats.salesBySize.length > 0) {
            updateSizeChart(stats.salesBySize);
        } else {
            console.log('Нет данных для графика размеров');
            showEmptyChartMessage('sizeChart', 'Нет данных по размерам');
        }
        
        // Обновляем таблицы
        updateTopProductsTable(stats.topProducts || []);
        updateSalesByBrandTable(stats.salesByBrand || []);
        updateVisitStatsTable(stats.visitStats || []);
        
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
        showStatisticsError(error.message);
    }
}

function updateKeyMetrics(totalStats) {
    console.log('Обновление ключевых показателей:', totalStats);
    
    // Безопасное получение значений с значениями по умолчанию
    const totalRevenue = totalStats.total_revenue || 0;
    const totalOrders = totalStats.total_orders || 0;
    const totalCustomers = totalStats.total_customers || 0;
    const avgOrderValue = totalStats.avg_order_value || 0;
    const completedOrders = totalStats.completed_orders || 0;
    
    console.log('Показатели:', {
        totalRevenue,
        totalOrders,
        totalCustomers,
        avgOrderValue,
        completedOrders
    });
    
    const totalRevenueEl = document.getElementById('totalRevenue');
    const totalOrdersEl = document.getElementById('totalOrders');
    const totalCustomersEl = document.getElementById('totalCustomers');
    const avgOrderValueEl = document.getElementById('avgOrderValue');
    const completedOrdersEl = document.getElementById('completedOrders');
    
    if (totalRevenueEl) totalRevenueEl.textContent = `${Math.round(totalRevenue).toLocaleString()} ₽`;
    if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
    if (totalCustomersEl) totalCustomersEl.textContent = totalCustomers;
    if (avgOrderValueEl) avgOrderValueEl.textContent = `${Math.round(avgOrderValue).toLocaleString()} ₽`;
    if (completedOrdersEl) completedOrdersEl.textContent = completedOrders;
}

function showEmptyChartMessage(chartId, message) {
    const canvas = document.getElementById(chartId);
    if (canvas && canvas.parentNode) {
        const parent = canvas.parentNode;
        const existingMsg = parent.querySelector('.empty-chart-message');
        if (!existingMsg) {
            const msgDiv = document.createElement('div');
            msgDiv.className = 'empty-chart-message';
            msgDiv.textContent = message;
            msgDiv.style.textAlign = 'center';
            msgDiv.style.padding = '50px';
            msgDiv.style.color = '#999';
            parent.appendChild(msgDiv);
        }
    }
}

function updateSalesChart(salesData) {
    const ctx = document.getElementById('salesChart')?.getContext('2d');
    if (!ctx) {
        console.log('Элемент salesChart не найден');
        return;
    }
    
    const dates = salesData.map(d => d.date);
    const revenues = salesData.map(d => parseFloat(d.total_sales) || 0);
    const itemsSold = salesData.map(d => parseInt(d.items_sold) || 0);
    
    if (salesChart) salesChart.destroy();
    
    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Выручка (₽)',
                    data: revenues,
                    borderColor: '#e67e22',
                    backgroundColor: 'rgba(230, 126, 34, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Количество товаров',
                    data: itemsSold,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            let value = context.raw;
                            if (context.dataset.label.includes('Выручка')) {
                                return label + ': ' + value.toLocaleString() + ' ₽';
                            }
                            return label + ': ' + value + ' шт';
                        }
                    }
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Выручка (₽)',
                        color: '#e67e22'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString() + ' ₽';
                        }
                    }
                },
                y1: {
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Количество товаров (шт)',
                        color: '#3498db'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
    
    console.log('График продаж обновлен');
}

function updateOrdersChart(salesData) {
    const ctx = document.getElementById('ordersChart')?.getContext('2d');
    if (!ctx) return;
    
    const dates = salesData.map(d => d.date);
    const orders = salesData.map(d => parseInt(d.orders_count) || 0);
    const customers = salesData.map(d => parseInt(d.unique_customers) || 0);
    
    if (ordersChart) ordersChart.destroy();
    
    ordersChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Количество заказов',
                    data: orders,
                    backgroundColor: 'rgba(46, 204, 113, 0.7)',
                    borderColor: '#27ae60',
                    borderWidth: 1,
                    borderRadius: 5
                },
                {
                    label: 'Уникальных клиентов',
                    data: customers,
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: '#2980b9',
                    borderWidth: 1,
                    borderRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.raw;
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Количество'
                    },
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function updateCategoryChart(categoriesData) {
    const ctx = document.getElementById('categoryChart')?.getContext('2d');
    if (!ctx) return;
    
    const categories = categoriesData.map(c => c.category || 'Другое');
    const revenues = categoriesData.map(c => parseFloat(c.revenue) || 0);
    
    if (categoryChart) categoryChart.destroy();
    
    const colors = ['#e67e22', '#3498db', '#2ecc71', '#e74c3c', '#9b59b6', '#f1c40f', '#1abc9c', '#e84393', '#00cec9', '#fd79a8'];
    
    categoryChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: revenues,
                backgroundColor: colors.slice(0, categories.length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value.toLocaleString()} ₽ (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function updateSizeChart(sizesData) {
    const ctx = document.getElementById('sizeChart')?.getContext('2d');
    if (!ctx) return;
    
    const sizes = sizesData.map(s => `${s.size} размер`);
    const quantities = sizesData.map(s => parseInt(s.total_quantity) || 0);
    
    if (sizeChart) sizeChart.destroy();
    
    sizeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sizes,
            datasets: [{
                label: 'Продано пар',
                data: quantities,
                backgroundColor: 'rgba(155, 89, 182, 0.7)',
                borderColor: '#8e44ad',
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Продано: ${context.raw} пар`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Количество проданных пар'
                    },
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            return value + ' шт';
                        }
                    }
                }
            }
        }
    });
}

function updateTopProductsTable(products) {
    const tableBody = document.getElementById('topProductsTable');
    if (!tableBody) return;
    
    if (!products || products.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">📭 Нет данных о продажах. Оформите хотя бы один заказ.</td></tr>';
        return;
    }
    
    tableBody.innerHTML = products.map((p, index) => `
        <tr class="${index < 3 ? 'rank-' + (index + 1) : ''}">
            <td><strong>${index + 1}</strong></td>
            <td><strong>${escapeHtml(p.name)}</strong></td>
            <td>${escapeHtml(p.brand)}</td>
            <td>${escapeHtml(p.category || '-')}</td>
            <td><strong>${p.total_sold || 0}</strong> шт</td>
            <td>${p.orders_count || 0} зак.</td>
            <td><strong style="color: #e67e22;">${(p.revenue || 0).toLocaleString()} ₽</strong></td>
        </tr>
    `).join('');
}

function updateSalesByBrandTable(brands) {
    const tableBody = document.getElementById('salesByBrandTable');
    if (!tableBody) return;
    
    if (!brands || brands.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">📭 Нет данных о продажах по брендам</td></tr>';
        return;
    }
    
    tableBody.innerHTML = brands.map(b => `
        <tr>
            <td><strong>${escapeHtml(b.brand)}</strong></td>
            <td>${b.total_sold || 0} шт</td>
            <td>${b.orders_count || 0} зак.</td>
            <td>${Math.round(b.avg_price || 0).toLocaleString()} ₽</td>
            <td><strong style="color: #e67e22;">${(b.revenue || 0).toLocaleString()} ₽</strong></td>
        </tr>
    `).join('');
}

function updateVisitStatsTable(visits) {
    const tableBody = document.getElementById('visitStatsTable');
    if (!tableBody) return;
    
    if (!visits || visits.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">📭 Нет данных о посещениях</td></tr>';
        return;
    }
    
    tableBody.innerHTML = visits.map(v => `
        <tr>
            <td>${escapeHtml(v.page_url)}</td>
            <td><strong>${v.visits || 0}</strong></td>
            <td>${v.unique_visitors || '-'}</td>
            <td>${v.registered_visitors || '-'}</td>
        </tr>
    `).join('');
}

function showStatisticsError(errorMessage) {
    console.error('Показ ошибки:', errorMessage);
    
    // Показываем сообщение об ошибке на странице
    const containers = [
        'topProductsTable',
        'salesByBrandTable',
        'visitStatsTable'
    ];
    
    containers.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = `<tr><td colspan="7" style="text-align: center;">❌ Ошибка загрузки данных: ${errorMessage}</td></tr>`;
        }
    });
    
    // Сбрасываем показатели
    const totalRevenueEl = document.getElementById('totalRevenue');
    const totalOrdersEl = document.getElementById('totalOrders');
    const totalCustomersEl = document.getElementById('totalCustomers');
    const avgOrderValueEl = document.getElementById('avgOrderValue');
    
    if (totalRevenueEl) totalRevenueEl.textContent = '0 ₽';
    if (totalOrdersEl) totalOrdersEl.textContent = '0';
    if (totalCustomersEl) totalCustomersEl.textContent = '0';
    if (avgOrderValueEl) avgOrderValueEl.textContent = '0 ₽';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}