# **App Name**: DentalFlow

## Core Features:

- Product Catalog: Display a catalog of dental products and services with detailed information, images, and pricing.
- Customizable Product Options: Allow users to configure products with options such as material selection, shade selection, tooth selection, and implant selection.
- STL File Upload and Validation: Enable users to upload STL files for specific products, with validation of file types and display of filename previews.
- Shopping Cart and Checkout: Implement a shopping cart system with features for updating quantities, applying coupons, and calculating totals.  The checkout flow should support login/registration, address and clinic data, and payment options (PIX, credit card, Boleto).
- Customer Account Management: Provide a user account area for managing orders, viewing order details (including status and timeline), accessing invoices, managing addresses, and updating account information.
- Admin Panel: Provide an admin dashboard for managing products, orders, users, and coupons. The admin interface should include features for updating order statuses, uploading technical files, and generating invoices. A kanban tool organizes all steps of production.
- Firebase Integration: Use Firebase Auth for authentication (PF/PJ), Firestore for storing data (users, products, orders, invoices, coupons, production), Firebase Storage for storing files, and Cloud Functions for backend logic (order creation, STL validation, payment webhooks, invoice generation, status updates, and email notifications).

## Style Guidelines:

- Primary color: Gold (#FFD700) for a premium feel, conveying quality and precision, necessary in dental services.
- Background color: Dark gray (#0A0A0A) for a minimalist, high-contrast, professional look.
- Accent color: Light gold (#FFEC8B) as the button hover color
- Body and headline font: 'Inter' (sans-serif) for a clean and modern user interface.
- Use professional and minimalist icons relevant to dental products and services. Ensure high contrast for visibility on the dark background.
- Maintain a clean, minimalist layout with a focus on high contrast and clear information hierarchy. Use cards (#1A1A1A) to group related content and create visual separation.
- Incorporate subtle micro-interactions and state transitions to enhance the user experience. Avoid overly flashy animations to maintain a professional and premium feel.