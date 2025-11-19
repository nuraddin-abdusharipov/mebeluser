import { db } from './firebase-config.js';
import { 
    collection, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    orderBy, 
    query,
    where,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// Admin panel uchun JavaScript
// catalog.js faylini to'liq yangilang
class ProductManager {
    constructor() {
        this.currentProduct = null;
        this.products = [];
        this.init();
    }

    async init() {
        await this.setupEventListeners();
        await this.loadProducts();
    }

    async loadProducts() {
        try {
            console.log("Firestoredan mahsulotlarni yuklash...");
            
            const q = query(
                collection(db, 'products'), 
                where('status', '==', 'active'),
                orderBy('createdAt', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            this.products = [];
            
            querySnapshot.forEach((doc) => {
                const productData = doc.data();
                this.products.push({
                    id: doc.id,
                    ...productData
                });
            });
            
            console.log("Yuklangan mahsulotlar:", this.products);
            this.displayProducts();
            
        } catch (error) {
            console.error('Mahsulotlarni yuklashda xatolik:', error);
            this.showError('Mahsulotlarni yuklashda xatolik yuz berdi: ' + error.message);
        }
    }

    displayProducts() {
        const container = document.getElementById('products-container');
        if (!container) {
            console.error("products-container topilmadi!");
            return;
        }

        if (this.products.length === 0) {
            container.innerHTML = '<p>Hozircha mahsulotlar mavjud emas</p>';
            return;
        }

        container.innerHTML = this.products.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image || 'https://picsum.photos/350/350'}" alt="${product.name}">
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
                    <p class="product-price">${product.price?.toLocaleString() || '0'} so'm</p>
                    <div class="product-rating">
                        ${this.generateRatingStars(product.rating || 4)}
                    </div>
                </div>
            </div>
        `).join('');

        // Event listenerlarni qayta o'rnatish
        this.setupProductEventListeners();
    }

    generateRatingStars(rating) {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        
        for (let i = 0; i < fullStars; i++) {
            stars.push('<i class="fas fa-star"></i>');
        }
        
        if (hasHalfStar) {
            stars.push('<i class="fas fa-star-half-alt"></i>');
        }
        
        const emptyStars = 5 - stars.length;
        for (let i = 0; i < emptyStars; i++) {
            stars.push('<i class="far fa-star"></i>');
        }
        
        return stars.join('');
    }

    setupProductEventListeners() {
        // Savatga qo'shish
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const name = button.dataset.name;
                const price = parseInt(button.dataset.price);
                // script.js dagi addToCart funksiyasini chaqiramiz
                if (window.addToCart) {
                    window.addToCart(name, price);
                }
            });
        });

        // Tez ko'rish
        document.querySelectorAll('.quick-view').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = button.dataset.productId;
                this.showQuickView(productId);
            });
        });
    }

    async showQuickView(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const modal = document.getElementById('quick-view-modal');
        const modalProductName = document.getElementById('modal-product-name');
        const modalProductPrice = document.getElementById('modal-product-price');
        const modalProductImage = document.getElementById('modal-product-image');
        const addToCartModalBtn = document.querySelector('.add-to-cart-modal');

        if (modalProductName) modalProductName.textContent = product.name;
        if (modalProductPrice) modalProductPrice.textContent = `${product.price?.toLocaleString() || '0'} so'm`;
        if (modalProductImage) {
            modalProductImage.src = product.image || 'https://picsum.photos/600/600';
            modalProductImage.alt = product.name;
        }
        
        if (addToCartModalBtn) {
            addToCartModalBtn.dataset.name = product.name;
            addToCartModalBtn.dataset.price = product.price;
        }

        if (modal) modal.style.display = 'block';
    }

    showError(message) {
        // Xatolik xabarini ko'rsatish
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 10000;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            document.body.removeChild(errorDiv);
        }, 5000);
    }

    async setupEventListeners() {
        // Filtrlarni qo'shish
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
    }

    applyFilters() {
        // Filtrlash logikasi
        console.log("Filtrlar qo'llanmoqda...");
        // Keyinroq implement qilamiz
    }
}

// Admin panelni ishga tushirish
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('admin-panel')) {
        new ProductManager();
    }
});
