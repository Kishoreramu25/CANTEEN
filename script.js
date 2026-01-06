// Snack Data
const snacks = [
    {
        id: 1,
        name: "Sprite (Cool drinks)",
        price: 15.30, // 15 + 2%
        description: "Chilled soft drink",
        image: "images/sprite.png"
    },
    {
        id: 2,
        name: "Frooty",
        price: 20.40, // 20 + 2%
        description: "Mango drink",
        image: "images/frooty.png"
    },
    {
        id: 3,
        name: "Coca Cola",
        price: 15.30, // 15 + 2%
        description: "Cold fizzy drink",
        image: "images/cocacola.png"
    },
    {
        id: 4,
        name: "Veg Puffs",
        price: 30.60, // 30 + 2%
        description: "Crispy bakery puff",
        image: "images/puffs.jpg"
    },
    {
        id: 5,
        name: "Egg Roll",
        price: 25.50, // 25 + 2%
        description: "Egg roll with spices",
        image: "images/eggroll.jpg"
    },
    {
        id: 6,
        name: "Pani Puri",
        price: 30.60, // 30 + 2%
        description: "Street style pani puri",
        image: "images/panipuri.jpg"
    },
    {
        id: 7,
        name: "Chicken Rice",
        price: 81.60, // 80 + 2%
        description: "Chicken fried rice",
        image: "images/chickenrice.jpg"
    },
    {
        id: 8,
        name: "Egg Rice",
        price: 71.40, // 70 + 2%
        description: "Egg fried rice",
        image: "images/eggrice.jpg"
    },
    {
        id: 9,
        name: "Parotta",
        price: 15.30, // 15 + 2%
        description: "Soft layered parotta",
        image: "images/parotta.jpg"
    },
    {
        id: 10,
        name: "Chilli Parotta",
        price: 81.60, // 80 + 2%
        description: "Spicy chilli parotta",
        image: "images/chilliparotta.jpg"
    },
    {
        id: 11,
        name: "Cream Bun",
        price: 15.30, // 15 + 2%
        description: "Sweet cream bun",
        image: "images/creambun.jpg"
    },
    {
        id: 12,
        name: "Jam Bun",
        price: 15.30, // 15 + 2%
        description: "Jam-filled bun",
        image: "images/jambun.jpg"
    }
];


// State
let cart = [];
let currentStep = 1;
let paymentScreenshot = null;
let lastOrderData = null;

// DOM Elements
const snacksGrid = document.getElementById('snacks-grid');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPriceEl = document.getElementById('cart-total-price');
const cartCountBadge = document.getElementById('cart-count');
const checkoutBtn = document.getElementById('checkout-btn');
const viewCartBtnWrapper = document.getElementById('view-cart-btn-wrapper');
const headerBackBtn = document.getElementById('header-back-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderSnacks();
    updateCartUI();

    // Check if PDF libraries are loaded
    if (!window.jspdf) {
        console.error("jsPDF library not found on load.");
        // alert("Warning: PDF Library not loaded properly. Receipts may not generate."); // Optional: Don't annoy user immediately
    } else {
        console.log("jsPDF library loaded successfully.");
    }

    if (headerBackBtn) {
        headerBackBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                goToStep(currentStep - 1);
            }
        });
    }
});

// Navigation Logic
window.goToStep = function (step) {
    // Validation before moving forward
    if (step === 3 && cart.length === 0) {
        showToast("Your cart is empty!");
        return;
    }

    // Hide all sections
    document.querySelectorAll('.step-section').forEach(el => el.style.display = 'none');

    // Show target section
    const sectionMap = {
        1: 'step-menu',
        2: 'step-cart',
        3: 'step-payment',
        4: 'step-details',
        5: 'step-success'
    };
    document.getElementById(sectionMap[step]).style.display = 'block';

    // Update Header Back Button
    if (headerBackBtn) {
        if (step > 1 && step < 5) {
            headerBackBtn.style.display = 'flex';
        } else {
            headerBackBtn.style.display = 'none';
        }
    }

    // Update Progress Indicator
    document.querySelectorAll('.step').forEach(el => {
        const s = parseInt(el.dataset.step);
        if (s === step) el.classList.add('active');
        else el.classList.remove('active');

        // Mark previous steps as completed (optional visual style)
        if (s < step) el.style.color = 'var(--primary-color)';
        else if (s > step) el.style.color = 'var(--muted-text)';
    });

    currentStep = step;
    window.scrollTo(0, 0);
};

// Render Snacks
function renderSnacks() {
    snacksGrid.innerHTML = snacks.map(snack => `
        <div class="snack-card">
            <div class="card-img-container">
                <img src="${snack.image}" alt="${snack.name}" class="snack-img" onerror="this.onerror=null;this.parentElement.innerHTML='<div class=\'card-img-placeholder\'><i class=\'fa-solid fa-utensils\'></i></div>'">
            </div>
            <div class="card-content">
                <div class="card-header">
                    <h3 class="snack-name">${snack.name}</h3>
                    <span class="snack-price">₹${snack.price}</span>
                </div>
                <p class="snack-desc">${snack.description}</p>
                <button class="add-btn" onclick="addToCart(${snack.id})">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// Cart Logic
window.addToCart = function (id) {
    const snack = snacks.find(s => s.id === id);
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.qty++;
    } else {
        cart.push({ ...snack, qty: 1 });
    }

    updateCartUI();
    showToast(`Added ${snack.name} to cart`);
};

window.removeFromCart = function (id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
};

window.updateQty = function (id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.qty += change;
        if (item.qty <= 0) {
            removeFromCart(id);
        } else {
            updateCartUI();
        }
    }
};

function updateCartUI() {
    // Update Cart Items HTML
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-msg" style="text-align: center; padding: 2rem;">
                <i class="fa-solid fa-basket-shopping" style="font-size: 3rem; color: #e5e7eb; margin-bottom: 1rem;"></i>
                <p>Your cart is empty</p>
                <p class="small" style="font-size: 0.8rem; color: #9ca3af;">Add some tasty snacks!</p>
            </div>
        `;
        checkoutBtn.disabled = true;
        viewCartBtnWrapper.style.display = 'none';
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <span class="item-price">₹${item.price} x ${item.qty}</span>
                </div>
                <div class="item-controls">
                    <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
                    <span class="item-qty">${item.qty}</span>
                    <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `).join('');
        checkoutBtn.disabled = false;
        viewCartBtnWrapper.style.display = 'block';
    }

    // Calculate Totals
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    cartTotalPriceEl.textContent = `₹${totalPrice}`;

    // Update Payment Display if it exists
    const payAmountDisplay = document.getElementById('pay-amount-display');
    if (payAmountDisplay) {
        payAmountDisplay.textContent = `₹${totalPrice}`;
    }

    cartCountBadge.textContent = totalQty;
}

// Payment Logic
const UPI_ID = "canteen@upi"; // REPLACE WITH ACTUAL UPI ID

window.triggerUPIPayment = function () {
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    if (totalAmount === 0) {
        showToast("Cart is empty!");
        return;
    }

    // UPI Deep Link
    const upiUrl = `upi://pay?pa=${UPI_ID}&pn=Campus Canteen&am=${totalAmount}&cu=INR&tn=Canteen Payment`;

    // Attempt to open UPI app
    window.location.href = upiUrl;

    showToast("Opening UPI App...");
};

window.handleFileUpload = function (input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            document.getElementById('preview-img').src = e.target.result;
            document.getElementById('file-preview').style.display = 'block';
            document.getElementById('file-name').textContent = file.name;
            paymentScreenshot = file;
        };

        reader.readAsDataURL(file);
    }
};

window.validatePaymentAndProceed = function () {
    if (!paymentScreenshot) {
        alert("Please upload the payment screenshot to proceed.");
        return;
    }
    goToStep(4);
};

// Final Submission
window.handleFinalSubmit = function (e) {
    e.preventDefault();

    // Get User Details
    const name = document.getElementById('student-name').value;
    const rollNo = document.getElementById('roll-number').value;
    const dept = document.getElementById('department').value;
    const txnId = document.getElementById('transaction-id').value;

    // Generate Order Info
    const orderId = `${name}_${txnId}`;
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    // Store Data for PDF
    lastOrderData = {
        name, rollNo, dept, txnId,
        orderId, date, time,
        items: [...cart], // Copy cart
        totalAmount
    };

    // Show Success
    document.getElementById('success-order-id').textContent = orderId;
    goToStep(5);

    // Clear Cart
    cart = [];
    updateCartUI();
};

window.downloadBill = function () {
    // alert("Debug: Download button clicked!"); // Uncomment for debugging
    console.log("Attempting to download bill...");

    if (!lastOrderData) {
        alert("Error: No order data found. Please place an order first.");
        return;
    }
    generatePDF(lastOrderData);
};

function old_generatePDF(data) {
    console.log("Starting PDF generation...", data);

    if (!window.jspdf) {
        alert("CRITICAL ERROR: jsPDF library is not loaded. \n\nPossible reasons:\n1. No Internet Connection\n2. Ad blocker blocking CDN\n\nPlease check your connection and refresh.");
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        if (typeof doc.autoTable !== 'function') {
            alert("CRITICAL ERROR: jsPDF-AutoTable plugin is not loaded.\n\nPlease check your connection and refresh.");
            return;
        }

        // --- Constants & Config ---
        const pageWidth = doc.internal.pageSize.width;
        const margin = 15;
        const centerX = pageWidth / 2;
        let y = 20; // Vertical cursor

        // --- Helper: Centered Text ---
        const centerText = (text, yPos) => {
            doc.text(text, centerX, yPos, { align: 'center' });
        };

        // --- Header ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        centerText("COLLEGE CANTEEN – DIGITAL RECEIPT", y);
        y += 15;

        // --- Order & Payment Info ---
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        const leftColX = margin;
        const rightColX = pageWidth - margin;

        // Order ID
        doc.text(`Order ID: ${data.orderId}`, leftColX, y);
        y += 6;
        // Payment ID (Transaction ID)
        doc.text(`Payment ID: ${data.txnId}`, leftColX, y);
        y += 6;
        // Payment Status
        doc.text(`Payment Status: PAID`, leftColX, y);
        doc.setTextColor(0, 128, 0); // Green check
        doc.text(" \u2714", leftColX + 35, y); // Checkmark
        doc.setTextColor(0, 0, 0); // Reset
        y += 6;
        // Paid On
        doc.text(`Paid On: ${data.date}, ${data.time}`, leftColX, y);
        y += 15;

        // --- Student Details ---
        doc.setFont("helvetica", "bold");
        doc.text("Student Details", leftColX, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        doc.text(`Name: ${data.name}`, leftColX, y);
        y += 6;
        doc.text(`Roll No: ${data.rollNo}`, leftColX, y);
        y += 6;
        doc.text(`Department: ${data.dept}`, leftColX, y);
        y += 15;

        // --- Items Table ---
        doc.setFont("helvetica", "bold");
        doc.text("Items", leftColX, y);
        y += 2; // Spacing before table

        const tableColumn = ["Product Name", "Quantity", "Price", "Total"];
        const tableRows = [];

        data.items.forEach(item => {
            const itemTotal = item.price * item.qty;
            const row = [
                item.name,
                item.qty.toString(),
                `Rs. ${item.price.toFixed(2)}`,
                `Rs. ${itemTotal.toFixed(2)}`
            ];
            tableRows.push(row);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: y,
            theme: 'plain', // Minimalist look
            styles: { fontSize: 10, cellPadding: 2 },
            headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 20, halign: 'center' },
                2: { cellWidth: 30, halign: 'right' },
                3: { cellWidth: 30, halign: 'right' }
            },
            margin: { left: margin, right: margin }
        });

        y = doc.lastAutoTable.finalY + 5;

        // --- Calculations ---
        // Assuming data.totalAmount includes the 2% tax
        const totalPaid = data.totalAmount;
        const subtotal = totalPaid / 1.02;
        const tax = totalPaid - subtotal;

        // Draw lines for totals
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 6;

        const valX = pageWidth - margin;

        doc.setFont("helvetica", "normal");
        doc.text("Subtotal", 120, y);
        doc.text(`Rs. ${subtotal.toFixed(2)}`, valX, y, { align: 'right' });
        y += 6;

        doc.text("Gateway Fee (2%)", 120, y);
        doc.text(`Rs. ${tax.toFixed(2)}`, valX, y, { align: 'right' });
        y += 6;

        doc.setFont("helvetica", "bold");
        doc.text("Total Paid", 120, y);
        doc.text(`Rs. ${totalPaid.toFixed(2)}`, valX, y, { align: 'right' });
        y += 15;

        // --- Warnings ---
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100); // Grey

        doc.text("\u26A0 Valid only for 10 minutes", leftColX, y);
        y += 5;
        doc.text("\u26A0 Show this receipt at canteen counter", leftColX, y);
        y += 15;

        // --- QR Code Placeholder ---
        const qrSize = 40;
        const qrX = centerX - (qrSize / 2);
        doc.setDrawColor(0);
        doc.rect(qrX, y, qrSize, qrSize); // Box
        doc.setFontSize(8);
        centerText("[QR CODE HERE]", y + (qrSize / 2));
        y += qrSize + 10;

        // --- Footer ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        centerText("COLLEGE CANTEEN – PAID", y);

        // --- Save/View PDF ---
        // Sanitize filename
        const cleanOrderId = data.orderId ? data.orderId.replace(/[^a-z0-9]/gi, '_') : 'Order';
        const filename = `${cleanOrderId}_Receipt.pdf`;

        try {
            console.log("Generated Filename:", filename);

            // 1. Create Blob
            const blob = doc.output('blob');
            const blobUrl = URL.createObjectURL(blob);

            // 2. Open in New Tab (Best for viewing)
            const newWindow = window.open(blobUrl, '_blank');
            if (!newWindow) {
                alert("Receipt generated! If it didn't open, please check your downloads.");
            }

            // 3. Trigger Download (Backup)
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Cleanup
            setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);

        } catch (e) {
            console.error("PDF Save Error:", e);
            alert("Error saving PDF. Please check console.");
        }
    } catch (err) {
        console.error("PDF Generation Error:", err);
        alert("Failed to generate PDF. Please try again.");
    }
}


// Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function generatePDF(data) {
    console.log("Starting PDF generation with template...", data);

    if (!window.jspdf) {
        alert("CRITICAL ERROR: jsPDF library is not loaded. \n\nPossible reasons:\n1. No Internet Connection\n2. Ad blocker blocking CDN\n\nPlease check your connection and refresh.");
        return;
    }

    // Load Template Image
    const img = new Image();
    img.src = 'images/receipt_template.png';

    img.onload = function () {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            if (typeof doc.autoTable !== 'function') {
                alert("CRITICAL ERROR: jsPDF-AutoTable plugin is not loaded.\n\nPlease check your connection and refresh.");
                return;
            }

            // --- Constants & Config ---
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 20;
            const centerX = pageWidth / 2;
            let y = 70; // Start lower to avoid the "ZENETIVE INFOTECH" header in the image

            // --- Add Template Background ---
            doc.addImage(img, 'PNG', 0, 0, pageWidth, pageHeight);

            // --- Helper: Centered Text ---
            const centerText = (text, yPos) => {
                doc.text(text, centerX, yPos, { align: 'center' });
            };

            // --- Title (Optional, if not in template) ---
            // doc.setFont("helvetica", "bold");
            // doc.setFontSize(16);
            // doc.setTextColor(0, 51, 153); 
            // centerText("DIGITAL RECEIPT", y);
            // y += 10;

            // --- Order & Payment Info ---
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);

            const leftColX = margin;

            // Order ID
            doc.text(`Order ID: ${data.orderId}`, leftColX, y);
            y += 6;
            // Payment ID (Transaction ID)
            doc.text(`Payment ID: ${data.txnId}`, leftColX, y);
            y += 6;
            // Payment Status
            doc.text(`Payment Status: PAID`, leftColX, y);
            doc.setTextColor(0, 128, 0); // Green check
            doc.text(" \u2714", leftColX + 35, y); // Checkmark
            doc.setTextColor(0, 0, 0); // Reset
            y += 6;
            // Paid On
            doc.text(`Paid On: ${data.date}, ${data.time}`, leftColX, y);
            y += 15;

            // --- Student Details ---
            doc.setFont("helvetica", "bold");
            doc.text("Student Details", leftColX, y);
            y += 6;
            doc.setFont("helvetica", "normal");
            doc.text(`Name: ${data.name}`, leftColX, y);
            y += 6;
            doc.text(`Roll No: ${data.rollNo}`, leftColX, y);
            y += 6;
            doc.text(`Department: ${data.dept}`, leftColX, y);
            y += 15;

            // --- Items Table ---
            doc.setFont("helvetica", "bold");
            doc.text("Items", leftColX, y);
            y += 2; // Spacing before table

            const tableColumn = ["Product Name", "Quantity", "Price", "Total"];
            const tableRows = [];

            data.items.forEach(item => {
                const itemTotal = item.price * item.qty;
                const row = [
                    item.name,
                    item.qty.toString(),
                    `Rs. ${item.price.toFixed(2)}`,
                    `Rs. ${itemTotal.toFixed(2)}`
                ];
                tableRows.push(row);
            });

            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: y,
                theme: 'plain',
                styles: { fontSize: 10, cellPadding: 2 },
                headStyles: { fillColor: [0, 114, 255], textColor: 255, fontStyle: 'bold' }, // Blue header to match template
                columnStyles: {
                    0: { cellWidth: 'auto' },
                    1: { cellWidth: 20, halign: 'center' },
                    2: { cellWidth: 30, halign: 'right' },
                    3: { cellWidth: 30, halign: 'right' }
                },
                margin: { left: margin, right: margin }
            });

            y = doc.lastAutoTable.finalY + 5;

            // --- Calculations ---
            const totalPaid = data.totalAmount;
            const subtotal = totalPaid / 1.02;
            const tax = totalPaid - subtotal;

            // Draw lines for totals
            doc.setLineWidth(0.5);
            doc.line(margin, y, pageWidth - margin, y);
            y += 6;

            const valX = pageWidth - margin;

            doc.setFont("helvetica", "normal");
            doc.text("Subtotal", 120, y);
            doc.text(`Rs. ${subtotal.toFixed(2)}`, valX, y, { align: 'right' });
            y += 6;

            doc.text("Gateway Fee (2%)", 120, y);
            doc.text(`Rs. ${tax.toFixed(2)}`, valX, y, { align: 'right' });
            y += 6;

            doc.setFont("helvetica", "bold");
            doc.text("Total Paid", 120, y);
            doc.text(`Rs. ${totalPaid.toFixed(2)}`, valX, y, { align: 'right' });
            y += 15;

            // --- Footer ---
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            centerText("COLLEGE CANTEEN – PAID", y);

            // --- Save/View PDF ---
            const cleanOrderId = data.orderId ? data.orderId.replace(/[^a-z0-9]/gi, '_') : 'Order';
            const filename = `${cleanOrderId}_Receipt.pdf`;

            console.log("Generated Filename:", filename);

            const blob = doc.output('blob');
            const blobUrl = URL.createObjectURL(blob);

            // --- Mobile Share (Best for iOS/Android) ---
            // Try to use native sharing if available (works best on mobile)
            const file = new File([blob], filename, { type: 'application/pdf' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator.share({
                    files: [file],
                    title: 'Canteen Receipt',
                    text: `Receipt for Order ${data.orderId}`
                }).catch((err) => {
                    console.log("Share failed or canceled:", err);
                    // Fallback to normal download if share fails
                    triggerDownload();
                });
            } else {
                triggerDownload();
            }

            function triggerDownload() {
                // 1. Open in New Tab (Backup for viewing)
                const newWindow = window.open(blobUrl, '_blank');
                if (!newWindow) {
                    // console.log("Popup blocked");
                }

                // 2. Trigger Download (Standard)
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }

            // Cleanup
            setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);

        } catch (err) {
            console.error("PDF Generation Error:", err);
            alert("Failed to generate PDF. Please try again.");
        }
    };

    img.onerror = function () {
        alert("Error loading receipt template image. Please check if 'images/receipt_template.png' exists.");
    };
}
