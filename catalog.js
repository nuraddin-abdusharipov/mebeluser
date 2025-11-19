// catalog.js - TEST MA'LUMOTLARSIZ VERSIYA
import { db } from './firebase-config.js';
import { 
    collection, 
    getDocs,
    query, 
    orderBy,
    where 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// catalog.js - MODULSIZ VERSIYA
class ProductManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.productsPerPage = 6;
        
        // Firebase ni global o'zgaruvchilar orqali ishlatamiz
        this.db = window.db;
        this.firestore = window.firestore;
        
        this.init();
    }

    async init() {
        console.log("ProductManager ishga tushdi...");
        await this.loadProducts();
        this.setupEventListeners();
    }

    async loadProducts() {
        try {
            console.log("Firestoredan mahsulotlarni yuklash...");
            
            if (!this.db) {
                throw new Error("Firebase ishga tushmagan");
            }
            
            // Firestore dan mahsulotlarni olish
            const querySnapshot = await this.firestore.getDocs(this.firestore.collection(this.db, 'products'));
            
            this.products = [];
            
            querySnapshot.forEach((doc) => {
                const productData = doc.data();
                
                // Client tomonda filtrlash
                if (productData.status !== 'inactive') {
                    this.products.push({
                        id: doc.id,
                        name: productData.name || 'Nomsiz mahsulot',
                        price: productData.price || 0,
                        image: productData.image || this.getDefaultImage(),
                        category: productData.category || 'umumiy',
                        rating: productData.rating || 4,
                        description: productData.description || 'Tavsif mavjud emas',
                        createdAt: productData.createdAt || new Date(),
                        status: productData.status || 'active'
                    });
                }
            });
            
            // Client tomonda saralash
            this.products.sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            
            console.log(`Yuklangan mahsulotlar soni: ${this.products.length}`);
            
            this.filteredProducts = [...this.products];
            this.displayProducts();
            
        } catch (error) {
            console.error('Mahsulotlarni yuklashda xatolik:', error);
            this.showError('Mahsulotlarni yuklashda xatolik: ' + error.message);
        }
    }

    getDefaultImage() {
        const defaultImages = [
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=350&h=350&fit=crop',
            'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=350&h=350&fit=crop',
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=350&h=350&fit=crop'
        ];
        return defaultImages[Math.floor(Math.random() * defaultImages.length)];
    }

    displayProducts() {
        const container = document.getElementById('products-container');
        if (!container) {
            console.error("products-container topilmadi!");
            return;
        }

        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        const currentProducts = this.filteredProducts.slice(startIndex, endIndex);

        if (currentProducts.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <h3>Hozircha mahsulotlar mavjud emas</h3>
                    <p>Tez orada yangi mahsulotlar qo'shiladi</p>
                </div>
            `;
            return;
        }

        container.innerHTML = currentProducts.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <div class="product-actions">
                        <button class="action-btn quick-view" data-product-id="${product.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn add-to-wishlist">
                            <i class="far fa-heart"></i>
                        </button>
                        <button class="action-btn add-to-cart" 
                                data-name="${product.name}" 
                                data-price="${product.price}">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-price">${product.price.toLocaleString()} so'm</p>
                    <div class="product-rating">
                        ${this.generateRatingStars(product.rating)}
                    </div>
                </div>
            </div>
        `).join('');

        this.setupProductEventListeners();
        this.updatePagination();
    }

    generateRatingStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }

    setupProductEventListeners() {
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const name = button.dataset.name;
                const price = parseInt(button.dataset.price);
                
                if (window.addToCart) {
                    window.addToCart(name, price);
                } else {
                    console.log("Savatga qo'shish:", name, price);
                    this.showNotification(`${name} savatga qo'shildi!`);
                }
            });
        });

        document.querySelectorAll('.quick-view').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = button.dataset.productId;
                this.showQuickView(productId);
            });
        });
    }

    showQuickView(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const modal = document.getElementById('quick-view-modal');
        const modalProductName = document.getElementById('modal-product-name');
        const modalProductPrice = document.getElementById('modal-product-price');
        const modalProductImage = document.getElementById('modal-product-image');
        const addToCartModalBtn = document.querySelector('.add-to-cart-modal');

        if (modalProductName) modalProductName.textContent = product.name;
        if (modalProductPrice) modalProductPrice.textContent = `${product.price.toLocaleString()} so'm`;
        if (modalProductImage) {
            modalProductImage.src = product.image;
            modalProductImage.alt = product.name;
        }
        
        if (addToCartModalBtn) {
            addToCartModalBtn.dataset.name = product.name;
            addToCartModalBtn.dataset.price = product.price;
            addToCartModalBtn.onclick = () => {
                if (window.addToCart) {
                    window.addToCart(product.name, product.price);
                }
                modal.style.display = 'none';
            };
        }

        if (modal) modal.style.display = 'block';
    }

    setupEventListeners() {
        const categoryFilter = document.getElementById('category');
        const priceFilter = document.getElementById('price');
        const sortFilter = document.getElementById('sort');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.applyFilters());
        }
        if (priceFilter) {
            priceFilter.addEventListener('change', () => this.applyFilters());
        }
        if (sortFilter) {
            sortFilter.addEventListener('change', () => this.applyFilters());
        }

        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousPage());
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextPage());
        }

        const closeModal = document.querySelector('.close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                const modal = document.getElementById('quick-view-modal');
                if (modal) modal.style.display = 'none';
            });
        }

        window.addEventListener('click', (e) => {
            const modal = document.getElementById('quick-view-modal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    applyFilters() {
        const categoryFilter = document.getElementById('category');
        const priceFilter = document.getElementById('price');
        const sortFilter = document.getElementById('sort');

        let filtered = [...this.products];

        if (categoryFilter && categoryFilter.value !== 'all') {
            filtered = filtered.filter(product => product.category === categoryFilter.value);
        }

        if (priceFilter && priceFilter.value !== 'all') {
            const priceRange = priceFilter.value;
            
            filtered = filtered.filter(product => {
                switch (priceRange) {
                    case '0-5000000':
                        return product.price <= 5000000;
                    case '5000000-10000000':
                        return product.price >= 5000000 && product.price <= 10000000;
                    case '10000000-20000000':
                        return product.price >= 10000000 && product.price <= 20000000;
                    case '20000000+':
                        return product.price >= 20000000;
                    default:
                        return true;
                }
            });
        }

        if (sortFilter) {
            switch (sortFilter.value) {
                case 'price-low':
                    filtered.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    filtered.sort((a, b) => b.price - a.price);
                    break;
                case 'name':
                    filtered.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                default:
                    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            }
        }

        this.filteredProducts = filtered;
        this.currentPage = 1;
        this.displayProducts();
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.displayProducts();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.displayProducts();
        }
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        const pageNumbers = document.getElementById('page-numbers');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        if (pageNumbers) {
            let pagesHTML = '';
            const maxPages = 5;
            
            let startPage = Math.max(1, this.currentPage - 2);
            let endPage = Math.min(totalPages, startPage + maxPages - 1);
            
            if (endPage - startPage + 1 < maxPages) {
                startPage = Math.max(1, endPage - maxPages + 1);
            }
            
            for (let i = startPage; i <= endPage; i++) {
                pagesHTML += `
                    <span class="page-number ${i === this.currentPage ? 'active' : ''}" 
                          onclick="productManager.goToPage(${i})">
                        ${i}
                    </span>
                `;
            }
            pageNumbers.innerHTML = pagesHTML;
        }

        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
        }
        if (nextBtn) {
            nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;
        }
    }

    goToPage(page) {
        this.currentPage = page;
        this.displayProducts();
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            max-width: 400px;
        `;
        errorDiv.innerHTML = `
            <strong>Xatolik!</strong><br>${message}
        `;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
            }
        }, 5000);
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            animation: slideInRight 0.5s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.animation = 'fadeOut 0.5s ease';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 500);
            }
        }, 3000);
    }
}

// Global o'zgaruvchi
let productManager;

// DOM yuklanganda ishga tushirish
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM yuklandi, ProductManager ishga tushmoqda...");
    
    // Firebase global o'zgaruvchilari mavjudligini tekshirish
    if (window.db && window.firestore) {
        productManager = new ProductManager();
    } else {
        console.error("Firebase ishga tushmagan!");
        document.getElementById('products-container').innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <h3>Firebase ishga tushmagan</h3>
                <p>Iltimos, qaytadan urinib ko'ring</p>
            </div>
        `;
    }
});
