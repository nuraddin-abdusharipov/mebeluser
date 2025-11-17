// Admin panel uchun JavaScript
class ProductManager {
    constructor() {
        this.currentProduct = null;
        this.init();
    }

    async init() {
        await this.setupEventListeners();
        await this.loadProducts();
    }

    // Mahsulot yuklash
    async loadProducts() {
        try {
            const snapshot = await db.collection('products')
                .orderBy('createdAt', 'desc')
                .get();
            
            this.displayProducts(snapshot);
        } catch (error) {
            console.error('Mahsulotlarni yuklashda xatolik:', error);
        }
    }

    // Mahsulot qo'shish/yangilash
    async saveProduct(productData) {
        try {
            if (this.currentProduct) {
                // Yangilash
                await db.collection('products').doc(this.currentProduct).update({
                    ...productData,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // Yangi qo'shish
                await db.collection('products').add({
                    ...productData,
                    status: 'active',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            this.resetForm();
            await this.loadProducts();
        } catch (error) {
            console.error('Mahsulotni saqlashda xatolik:', error);
        }
    }

    // Rasm yuklash (Cloudinary yoki boshqa servis)
    async uploadImage(file) {
        // Bu yerda Cloudinary yoki boshqa image hosting servisiga yuklash logikasi
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'your_upload_preset');

        try {
            const response = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Rasm yuklashda xatolik:', error);
            throw error;
        }
    }
}

// Admin panelni ishga tushirish
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('admin-panel')) {
        new ProductManager();
    }
});