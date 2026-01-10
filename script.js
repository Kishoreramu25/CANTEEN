// Snack Data
const snacks = [
    {
        id: 1,
        name: "Sprite (Cool drinks)",
        price: 15,
        description: "Chilled soft drink",
        image: "images/sprite.png"
    },
    {
        id: 2,
        name: "Frooty",
        price: 20,
        description: "Mango drink",
        image: "images/frooty.png"
    },
    {
        id: 3,
        name: "Coca Cola",
        price: 15,
        description: "Cold fizzy drink",
        image: "images/cocacola.png"
    },
    {
        id: 4,
        name: "Veg Puffs",
        price: 30,
        description: "Crispy bakery puff",
        image: "images/puffs.jpg"
    },
    {
        id: 5,
        name: "Egg Roll",
        price: 25,
        description: "Egg roll with spices",
        image: "images/eggroll.jpg"
    },
    {
        id: 6,
        name: "Pani Puri",
        price: 30,
        description: "Street style pani puri",
        image: "images/panipuri.jpg"
    },
    {
        id: 7,
        name: "Chicken Rice",
        price: 80,
        description: "Chicken fried rice",
        image: "images/chickenrice.jpg"
    },
    {
        id: 8,
        name: "Egg Rice",
        price: 70,
        description: "Egg fried rice",
        image: "images/eggrice.jpg"
    },
    {
        id: 9,
        name: "Parotta",
        price: 15,
        description: "Soft layered parotta",
        image: "images/parotta.jpg"
    },
    {
        id: 10,
        name: "Chilli Parotta",
        price: 80,
        description: "Spicy chilli parotta",
        image: "images/chilliparotta.jpg"
    },
    {
        id: 11,
        name: "Cream Bun",
        price: 15,
        description: "Sweet cream bun",
        image: "images/creambun.jpg"
    },
    {
        id: 12,
        name: "Jam Bun",
        price: 15,
        description: "Jam-filled bun",
        image: "images/jambun.jpg"
    }
];


// State
let cart = [];
let currentStep = 1;
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
const UPI_ID = "ramkisho28@okhdfcbank";

async function payWithRazorpay() {
    const payBtn = document.getElementById('pay-btn');
    const originalBtnContent = payBtn.innerHTML;

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    if (totalAmount === 0) {
        showToast("Cart is empty!");
        return;
    }

    // Feedback: Change Button State
    payBtn.disabled = true;
    payBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    payBtn.style.backgroundColor = '#6c757d'; // Grey out
    payBtn.style.cursor = 'not-allowed';

    // Helper to revert button
    const revertButton = () => {
        payBtn.disabled = false;
        payBtn.innerHTML = originalBtnContent;
        payBtn.style.backgroundColor = ''; // Revert to CSS default
        payBtn.style.cursor = '';
    };

    // 1. Create Order
    try {
        const response = await fetch('/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: totalAmount })
        });
        const order = await response.json();

        if (!order || !order.id) {
            alert("Failed to create order. Please try again.");
            revertButton();
            return;
        }

        // 2. Options for Checkout
        const options = {
            "key": "rzp_test_S159syeQZthVOQ", // Enter the Key ID generated from the Dashboard
            "amount": order.amount,
            "currency": "INR",
            "name": "Esec GK Foods",
            "description": "Canteen Order",
            "image": "images/logo.png", // Ensure you have a logo or remove this line
            "order_id": order.id,
            "handler": async function (response) {
                // 3. Verify Payment
                await verifyPayment(response);
            },
            "modal": {
                "ondismiss": function () {
                    revertButton(); // Revert if user closes popup
                }
            },
            "prefill": {
                "name": "", // We can prefill if we asked for details earlier
                "email": "",
                "contact": ""
            },
            "theme": {
                "color": "#3399cc"
            }
        };

        const rzp1 = new Razorpay(options);
        rzp1.on('payment.failed', function (response) {
            alert("Payment Failed: " + response.error.description);
            revertButton();
        });
        rzp1.open();

    } catch (err) {
        console.error("Error initiating payment:", err);
        alert("Error connecting to payment server.");
        revertButton();
    }
}

async function verifyPayment(paymentData) {
    try {
        const response = await fetch('/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData)
        });
        const result = await response.json();

        if (result.success) {
            // Success! Move to Details Step or Auto-Submit
            // Note: Original flow goes 1->2->3(Payment)->4(Details)->5(Success)
            // We can allow user to fill details now or just move to step 4.
            // Since the original flow asks for details in Step 4, we should go there.
            // However, we might want to pass the transaction ID automatically.

            document.getElementById('transaction-id').value = paymentData.razorpay_payment_id;
            document.getElementById('transaction-id').readOnly = true; // Lock it

            showToast("Payment Successful!");
            goToStep(4);
        } else {
            alert("Payment Verification Failed!");
        }
    } catch (err) {
        console.error("Verification Error:", err);
        alert("Error verifying payment.");
    }
}

// Manual payment functions removed. Now using Razorpay only.

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

    // Show Success & Populate Receipt
    document.getElementById('success-order-id').textContent = orderId;

    // --- POPULATE ON-SCREEN RECEIPT ---
    const receiptDetails = document.getElementById('receipt-details');
    const receiptBody = document.getElementById('receipt-items-body');
    const receiptTotal = document.getElementById('receipt-total');

    if (receiptDetails && receiptBody) {
        // Student Info
        receiptDetails.innerHTML = `
            <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 5px 0;"><strong>Roll No:</strong> ${rollNo}</p>
            <p style="margin: 5px 0;"><strong>Dept:</strong> ${dept}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${date} ${time}</p>
        `;

        // Clear Items
        receiptBody.innerHTML = '';

        // Add Items
        cart.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="padding: 5px; border-bottom: 1px solid #eee;">${item.name}</td>
                <td style="text-align: center; padding: 5px; border-bottom: 1px solid #eee;">${item.qty}</td>
                <td style="text-align: right; padding: 5px; border-bottom: 1px solid #eee;">₹${item.price * item.qty}</td>
            `;
            receiptBody.appendChild(row);
        });

        // Update Total
        if (receiptTotal) {
            receiptTotal.textContent = `₹${totalAmount}`;
        }
    }

    goToStep(5);

    // Clear Cart
    cart = [];
    updateCartUI();

    // Save to Supabase
    saveOrderToSupabase(lastOrderData);
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
    if (!window.jspdf) {
        alert("PDF Library not loaded. Please check connection.");
        return;
    }

    const img = new Image();
    // Prevent caching issues
    img.src = 'images/receipt_template.png?' + new Date().getTime();

    let isPDFGenerated = false;

    // Helper for manual download link
    function triggerDownload(blobUrl, filename) {
        try {
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Add MANUAL Link Fallback
            const successContainer = document.querySelector('.step-success');
            if (successContainer) {
                const existingLink = document.getElementById('manual-download-link');
                if (existingLink) existingLink.remove();
                const manualLink = document.createElement('a');
                manualLink.id = 'manual-download-link';
                manualLink.href = blobUrl;
                manualLink.download = filename;
                manualLink.textContent = "Click here if download didn't start";
                manualLink.style.display = 'block';
                manualLink.style.marginTop = '1rem';
                manualLink.style.color = '#0d6efd';
                manualLink.style.textDecoration = 'underline';
                manualLink.style.textAlign = 'center';
                successContainer.appendChild(manualLink);
            }
            setTimeout(() => URL.revokeObjectURL(blobUrl), 300000);
        } catch (e) { console.error(e); }
    }

    function createPDF(useImage) {
        if (isPDFGenerated) return;
        isPDFGenerated = true;

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            if (typeof doc.autoTable !== 'function') {
                alert("PDF Table plugin missing.");
                return;
            }

            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 20;
            const centerX = pageWidth / 2;
            let y = 70; // Default start Y for image template

            // --- Helper: Centered Text ---
            const centerText = (text, yPos) => {
                doc.text(text, centerX, yPos, { align: 'center' });
            };

            // Add Image if available and loaded
            if (useImage) {
                try {
                    doc.addImage(img, 'PNG', 0, 0, pageWidth, pageHeight);
                } catch (err) {
                    console.log("Image add failed, proceeding without it.");
                    // Reset Y if no image (since image has header)
                    y = 20;
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(20);
                    doc.setTextColor(0, 0, 0);
                    centerText("COLLEGE CANTEEN", y);
                    y += 15;
                }
            } else {
                // Fallback Header
                y = 20;
                doc.setFont("helvetica", "bold");
                doc.setFontSize(20);
                doc.setTextColor(0, 0, 0);
                centerText("COLLEGE CANTEEN", y);
                y += 15;
            }

            // --- Common PDF Content Construction ---
            const leftColX = margin;

            // Order & Payment Info
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);

            doc.text(`Order ID: ${data.orderId}`, leftColX, y);
            y += 6;
            doc.text(`Payment ID: ${data.txnId}`, leftColX, y);
            y += 6;
            doc.text(`Payment Status: PAID`, leftColX, y);
            doc.setTextColor(0, 128, 0);
            doc.text(" \u2714", leftColX + 35, y);
            doc.setTextColor(0, 0, 0);
            y += 6;
            doc.text(`Paid On: ${data.date}, ${data.time}`, leftColX, y);
            y += 15;

            // Student Details
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


            // Items Table

            doc.setFont("helvetica", "bold");
            doc.text("Items", leftColX, y);
            y += 2;

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
                headStyles: { fillColor: [0, 114, 255], textColor: 255, fontStyle: 'bold' },
                columnStyles: {
                    0: { cellWidth: 'auto' },
                    1: { cellWidth: 20, halign: 'center' },
                    2: { cellWidth: 30, halign: 'right' },
                    3: { cellWidth: 30, halign: 'right' }
                },
                margin: { left: margin, right: margin }
            });

            y = doc.lastAutoTable.finalY + 5;

            // Totals
            const totalPaid = data.totalAmount;
            const subtotal = totalPaid / 1.02;
            const tax = totalPaid - subtotal;

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

            // Footer
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            centerText("COLLEGE CANTEEN – PAID", y);

            // Save/Download Logic
            const cleanOrderId = data.orderId ? data.orderId.replace(/[^a-z0-9]/gi, '_') : 'Order';
            const filename = `${cleanOrderId}_Receipt.pdf`;
            const blob = doc.output('blob');
            const blobUrl = URL.createObjectURL(blob);

            // Trigger Download / Share
            const file = new File([blob], filename, { type: 'application/pdf' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator.share({
                    files: [file],
                    title: 'Canteen Receipt',
                    text: `Receipt for Order ${data.orderId}`
                }).catch((err) => {
                    console.log("Share failed:", err);
                    triggerDownload(blobUrl, filename);
                });
            } else {
                triggerDownload(blobUrl, filename);
            }

        } catch (e) {
            console.error(e);
            alert("Error generating PDF: " + e.message);
        }
    }

    // --- TIMEOUT PROTECTION ---
    // If image takes too long (>3s), proceed without it
    const timeout = setTimeout(() => {
        console.log("Image load timeout, generating plain PDF");
        createPDF(false);
    }, 3000);

    img.onload = function () {
        clearTimeout(timeout);
        createPDF(true);
    };

    img.onerror = function () {
        clearTimeout(timeout);
        // alert("Warning: Receipt template image failed to load. Generating plain receipt.");
        createPDF(false);
    };
}

// ---------------------------------------------------------
// SUPABASE & ADMIN DASHBOARD LOGIC
// ---------------------------------------------------------

const SUPABASE_URL = 'https://xzwvlizzccjimzqvrlbt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ZZBPvPQ_yI2EMImTKxyk9g_TwDUoETC';
let supabaseClient = null;

// Initialize Supabase
if (window.supabase) {
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("Supabase initialized");
    } catch (e) {
        console.error("Supabase init failed:", e);
    }
} else {
    // Retry once in case of race condition
    window.addEventListener('load', () => {
        if (window.supabase) {
            try {
                supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
                console.log("Supabase initialized (delayed)");
            } catch (e) {
                console.error("Supabase init failed:", e);
            }
        } else {
            console.error("Supabase SDK not loaded");
        }
    });
}

// --- DOM Elements for Admin ---
const adminLoginBtn = document.getElementById('admin-login-btn');
const adminLoginModal = document.getElementById('admin-login-modal');
const closeAdminLoginBtn = document.getElementById('close-admin-login');
const adminLoginForm = document.getElementById('admin-login-form');
const adminDashboardSection = document.getElementById('admin-dashboard-section');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const ordersContainer = document.getElementById('orders-container');
const loginErrorMsg = document.getElementById('login-error');

// --- Event Listeners ---

// Open Login Modal
if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Check if already logged in
        checkSession().then(session => {
            if (session) {
                openDashboard();
            } else {
                adminLoginModal.classList.remove('hidden');
            }
        });
    });
}

// Close Login Modal
if (closeAdminLoginBtn) {
    closeAdminLoginBtn.addEventListener('click', () => {
        adminLoginModal.classList.add('hidden');
        loginErrorMsg.classList.add('hidden');
    });
}

// Handle Login Submit
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;
        const submitBtn = adminLoginForm.querySelector('button[type="submit"]');

        submitBtn.disabled = true;
        submitBtn.textContent = "Signing In...";
        loginErrorMsg.classList.add('hidden');

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) throw error;

            // Success
            adminLoginModal.classList.add('hidden');
            adminLoginForm.reset();
            openDashboard();

        } catch (err) {
            console.error("Login failed:", err);
            loginErrorMsg.textContent = err.message || "Invalid credentials";
            loginErrorMsg.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Sign In";
        }
    });
}

// Logout
if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        adminDashboardSection.classList.add('hidden');
        showToast("Logged out successfully");
    });
}

// Refresh Dashboard
const adminRefreshBtn = document.getElementById('admin-refresh-btn');
if (adminRefreshBtn) {
    adminRefreshBtn.addEventListener('click', () => {
        const icon = adminRefreshBtn.querySelector('i');
        icon.classList.add('fa-spin');
        fetchAndRenderOrders().then(() => {
            setTimeout(() => icon.classList.remove('fa-spin'), 500); // Keep spinning a bit for effect
        });
    });
}

// --- Functions ---

async function checkSession() {
    if (!supabaseClient) return null;
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session;
}

function openDashboard() {
    adminDashboardSection.classList.remove('hidden');
    fetchAndRenderOrders();
}

async function saveOrderToSupabase(orderData) {
    if (!supabaseClient) {
        console.warn("Supabase client not ready, cannot save order.");
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('orders') // Assuming table name is 'orders'
            .insert([
                {
                    order_id: orderData.orderId,
                    student_name: orderData.name,
                    roll_no: orderData.rollNo,
                    department: orderData.dept,
                    transaction_id: orderData.txnId,
                    total_amount: orderData.totalAmount,
                    items: orderData.items,
                    created_at: new Date().toISOString()
                }
            ]);

        if (error) {
            console.error("Error saving order to Supabase:", error);
            alert("Error: " + (error.message || JSON.stringify(error)));
        } else {
            console.log("Order saved to Supabase successfully.");
            // Feedback to user
            showToast("Order recorded in Database!");
        }
    } catch (e) {
        console.error("Unexpected error saving order:", e);
        alert("Debug Error: Unexpected error saving order.");
    }
}

async function fetchAndRenderOrders() {
    if (!supabaseClient) return;

    ordersContainer.innerHTML = '<div class="col-span-full text-center"><i class="fas fa-spinner fa-spin text-4xl text-blue-500"></i><p>Loading orders...</p></div>';

    try {
        // Calculate 24 hours ago
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { data: orders, error } = await supabaseClient
            .from('orders')
            .select('*')
            .gt('created_at', oneDayAgo) // Filter: Created (Greater Than) 24 hours ago
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!orders || orders.length === 0) {
            ordersContainer.innerHTML = '<div class="col-span-full text-center text-gray-500">No orders found.</div>';
            return;
        }

        ordersContainer.innerHTML = orders.map(order => `
            <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500 relative">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-xl font-bold text-gray-800">${order.student_name || 'Unknown'}</h3>
                        <p class="text-sm text-gray-500">${order.roll_no || 'N/A'}</p>
                    </div>
                    <span class="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">PAID</span>
                </div>
                
                <div class="mb-4">
                    <p class="text-gray-600 text-sm"><span class="font-semibold">Dept:</span> ${order.department || 'N/A'}</p>
                    <p class="text-gray-600 text-sm"><span class="font-semibold">Total:</span> ₹${order.total_amount}</p>
                    <p class="text-gray-500 text-xs mt-1">${new Date(order.created_at).toLocaleString()}</p>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span class="text-xs text-gray-400 font-mono">${order.order_id}</span>
                    <button onclick="viewAdminOrderDetails('${order.id}')" class="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                        View Details <i class="fas fa-arrow-right ml-1"></i>
                    </button>
                </div>
                
                <!-- Hidden data for this order -->
                <textarea id="data-order-${order.id}" class="hidden">${JSON.stringify(order.items)}</textarea>
            </div>
        `).join('');

    } catch (err) {
        console.error("Error fetching orders:", err);
        ordersContainer.innerHTML = '<div class="col-span-full text-center text-red-500">Failed to load orders.</div>';
    }
}

// Global function to view details
window.viewAdminOrderDetails = function (dbId) {
    const rawData = document.getElementById(`data-order-${dbId}`).value;
    const items = JSON.parse(rawData);
    const modal = document.getElementById('order-details-modal');
    const content = document.getElementById('order-details-content');

    // Populate modal
    if (!items || items.length === 0) {
        content.innerHTML = '<p class="text-center text-gray-500">No items in this order.</p>';
    } else {
        const listHtml = items.map(item => `
            <div class="flex justify-between items-center bg-gray-50 p-3 rounded">
                <div>
                    <p class="font-semibold text-gray-800">${item.name}</p>
                    <p class="text-xs text-gray-500">Qty: ${item.qty}</p>
                </div>
                <p class="font-bold text-gray-800">₹${item.price * item.qty}</p>
            </div>
        `).join('');

        // Add total summary just in case
        const total = items.reduce((sum, i) => sum + (i.price * i.qty), 0);

        content.innerHTML = `
            <div class="space-y-2">
                ${listHtml}
            </div>
            <div class="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                <p class="text-lg font-bold">Total: ₹${total}</p>
            </div>
        `;
    }

    modal.classList.remove('hidden');
}

// Close Order Details Modal
document.getElementById('close-order-details')?.addEventListener('click', () => {
    document.getElementById('order-details-modal').classList.add('hidden');
});

// Close Dash on outside click (optional-ish, maybe just close on ESC)
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        document.getElementById('order-details-modal').classList.add('hidden');
        document.getElementById('admin-login-modal').classList.add('hidden');
        // Do not close dashboard on ESC, as it's a full page view overlay
    }
});

