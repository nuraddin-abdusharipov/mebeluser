// Asosiy JavaScript funksiyalari
document.addEventListener('DOMContentLoaded', function() {
    // Global o'zgaruvchilar
    const cartIcon = document.getElementById('cart-toggle');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const scrollToTopBtn = document.createElement('div');
    const header = document.querySelector('.main-header');
    const quickViewModal = document.getElementById('quick-view-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');

    let cart = [];
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;

    // Yuqoriga chiqish tugmasini yaratish
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    document.body.appendChild(scrollToTopBtn);

    // Hero slayderi
    function initSlider() {
        if (slides.length > 0) {
            setInterval(nextSlide, 5000);
            
            document.querySelector('.next-slide')?.addEventListener('click', nextSlide);
            document.querySelector('.prev-slide')?.addEventListener('click', prevSlide);
        }
    }

    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % totalSlides;
        slides[currentSlide].classList.add('active');
    }

    function prevSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        slides[currentSlide].classList.add('active');
    }

    // Savat funksiyalari
    function addToCart(name, price) {
        const existingProduct = cart.find(item => item.name === name);
        if (existingProduct) {
            existingProduct.quantity++;
        } else {
            cart.push({ name, price, quantity: 1 });
        }
        updateCartUI();
        showNotification(`${name} savatga qo'shildi!`);
    }

    function updateCartUI() {
        const cartItemsContainer = document.getElementById('cart-items-container');
        const cartCount = document.getElementById('cart-count');
        const cartTotalPrice = document.getElementById('cart-total-price');

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Savatingiz bo\'sh</p>';
            cartCount.textContent = '0';
            cartTotalPrice.textContent = '0 so\'m';
            return;
        }

        let totalPrice = 0;
        let totalItems = 0;
        let cartHTML = '';

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;
            totalItems += item.quantity;

            cartHTML += `
                <div class="cart-item">
                    <img src="https://picsum.photos/seed/${item.name}/80/80.jpg" alt="${item.name}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p class="cart-item-price">${item.price.toLocaleString()} so'm</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="decrease-quantity" data-name="${item.name}">-</button>
                        <span>${item.quantity}</span>
                        <button class="increase-quantity" data-name="${item.name}">+</button>
                    </div>
                </div>
            `;
        });

        cartItemsContainer.innerHTML = cartHTML;
        cartCount.textContent = totalItems;
        cartTotalPrice.textContent = `${totalPrice.toLocaleString()} so'm`;

        // Miqdor tugmalari uchun event listenerlar
        document.querySelectorAll('.decrease-quantity').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const name = e.target.dataset.name;
                const item = cart.find(i => i.name === name);
                if (item && item.quantity > 1) {
                    item.quantity--;
                } else {
                    cart = cart.filter(i => i.name !== name);
                }
                updateCartUI();
            });
        });

        document.querySelectorAll('.increase-quantity').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const name = e.target.dataset.name;
                const item = cart.find(i => i.name === name);
                if (item) {
                    item.quantity++;
                    updateCartUI();
                }
            });
        });
    }

    // Tez ko'rish modali
    function initQuickView() {
        const quickViewButtons = document.querySelectorAll('.quick-view');
        const modalProductName = document.getElementById('modal-product-name');
        const modalProductPrice = document.getElementById('modal-product-price');
        const modalProductImage = document.getElementById('modal-product-image');
        const addToCartModalBtn = document.querySelector('.add-to-cart-modal');

        quickViewButtons.forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.dataset.productId;
                const productData = {
                    1: { name: 'Milan divan to\'plami', price: 12500000, image: 'product1' },
                    2: { name: 'Luna yotoq to\'plami', price: 15800000, image: 'product2' },
                    3: { name: 'Ariana oshxona to\'plami', price: 22000000, image: 'product3' },
                };

                const product = productData[productId];
                if (product) {
                    modalProductName.textContent = product.name;
                    modalProductPrice.textContent = `${product.price.toLocaleString()} so'm`;
                    modalProductImage.src = `https://picsum.photos/seed/${product.image}/600/600.jpg`;
                    modalProductImage.alt = product.name;
                    addToCartModalBtn.dataset.name = product.name;
                    addToCartModalBtn.dataset.price = product.price;
                    quickViewModal.style.display = 'block';
                }
            });
        });

        // Modaldan savatga qo'shish
        addToCartModalBtn.addEventListener('click', () => {
            const name = addToCartModalBtn.dataset.name;
            const price = parseInt(addToCartModalBtn.dataset.price);
            addToCart(name, price);
            quickViewModal.style.display = 'none';
        });
    }

    // Xabar ko'rsatish
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background-color: var(--primary-color);
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: var(--shadow-heavy);
            z-index: 4000;
            animation: slideInRight 0.5s ease;
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.5s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }

    // Event listenerlar
    function initEventListeners() {
        // Savatni ochish/yopish
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            cartSidebar.classList.add('open');
        });

        closeCartBtn.addEventListener('click', () => {
            cartSidebar.classList.remove('open');
        });

        // Modalni yopish
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                quickViewModal.style.display = 'none';
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target === quickViewModal) {
                quickViewModal.style.display = 'none';
            }
        });

        // Scroll eventlari
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
                scrollToTopBtn.classList.add('show');
            } else {
                header.classList.remove('scrolled');
                scrollToTopBtn.classList.remove('show');
            }
        });

        // Yuqoriga chiqish
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Mobil menyu
        mobileMenuBtn.addEventListener('click', () => {
            mainNav.classList.toggle('show');
        });

        // Savatga qo'shish tugmalari
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const name = button.dataset.name;
                const price = parseInt(button.dataset.price);
                addToCart(name, price);
            });
        });
    }

    // Dasturni ishga tushirish
    function init() {
        initSlider();
        initQuickView();
        initEventListeners();
        updateCartUI();
        
        // CSS animatsiyalarni qo'shish
        const styleSheet = document.styleSheets[0];
        styleSheet.insertRule(`
            .scroll-to-top {
                position: fixed;
                bottom: 30px;
                right: 30px;
                background-color: var(--primary-color);
                color: var(--white-color);
                width: 50px;
                height: 50px;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 1.5rem;
                cursor: pointer;
                opacity: 0;
                visibility: hidden;
                transition: all var(--transition-speed) ease;
                z-index: 999;
            }
        `, styleSheet.cssRules.length);
        
        styleSheet.insertRule(`
            .scroll-to-top.show {
                opacity: 1;
                visibility: visible;
            }
        `, styleSheet.cssRules.length);
        
        styleSheet.insertRule(`
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `, styleSheet.cssRules.length);
        
        styleSheet.insertRule(`
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `, styleSheet.cssRules.length);
        
        styleSheet.insertRule(`
            .main-nav.show {
                display: block;
                position: absolute;
                top: 100%;
                left: 0;
                width: 100%;
                background-color: var(--primary-color);
            }
            
            .main-nav.show ul {
                flex-direction: column;
                padding: 20px;
            }
        `, styleSheet.cssRules.length);
    }

    // Dasturni ishga tushirish
    init();
});