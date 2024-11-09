## Route NodeJS Backend for E-Commerce Project 🛍️

This repository contains the backend for an E-Commerce project built with NodeJS and Express.js. It's designed to provide a robust API for managing products, categories, users, orders, and more. 

This project is a direct implementation of the E-Commerce project presented by Eng. Amira, and it serves as a fantastic resource for learning backend development in NodeJS.

### Features 🚀

* **Authentication and Authorization:**  Secure user registration, login, password reset, and token-based authentication.
* **Category and Subcategory Management:**  Create, read, update, and delete categories and subcategories. 
* **Brand Management:**  Add, delete, and update brands associated with subcategories.
* **Product Management:** Create, read, update, and delete products, including detailed product specifications.
* **User Management:**  Manage user profiles and user data, including password updates.
* **Cart Management:**  Add products to carts, adjust quantities, and remove products.
* **Coupon Management:** Create, apply, disable, enable, and manage coupons.
* **Order Management:** Place orders, track order status, handle payment confirmations, and manage order deliveries. 
* **Review System:** Allow users to write reviews and ratings for products.
* **Socket.IO Integration:** Real-time product updates for enhanced user experiences.
* **Stripe Integration:** Secure payment processing with Stripe API. 
* **Cloudinary Integration:** Upload and manage product images efficiently with Cloudinary.
* **PDF Generation:** Create and generate invoices in PDF format using the PDFKit library.
* **Email Service:** Send emails with confirmations, invoices, and other relevant notifications.
* **GraphQL Implementation:**  Provides a GraphQL API for accessing and manipulating data.

### Technologies 🛠️

* **NodeJS:** JavaScript runtime environment.
* **Express.js:** Web framework for building robust APIs.
* **Mongoose:** ODM (Object Document Mapper) for MongoDB interactions.
* **MongoDB:** NoSQL database for storing application data.
* **JWT:** JSON Web Tokens for authentication.
* **Bcrypt:**  Password hashing library for security.
* **Cloudinary:** Cloud storage solution for managing images.
* **Stripe:** Payment processing platform.
* **PDFKit:**  Library for generating PDF documents.
* **Nodemailer:**  Email library for sending email notifications.
* **Socket.IO:** Library for real-time communication. 
* **GraphQL:**  Query language for APIs. 

### Project Structure 📁

```
route-nodejs-backend
├── DB
│   └── connection.js
├── config
│   ├── prod.config.env
│   └── dev.config.env
├── src
│   ├── initiate-app.js
│   ├── utils
│   │   ├── cloudinary.js
│   │   ├── crons.js
│   │   ├── generate-Unique-String.js
│   │   ├── pagination.js
│   │   ├── qr-code.js
│   │   ├── systemRoles.js
│   │   ├── allowedExtensions.js
│   │   ├── coupon-validation.js
│   │   └── io-generation.js
│   ├── services
│   │   └── send-email.service.js
│   ├── modules
│   │   ├── Brand
│   │   │   ├── graphQL
│   │   │   │   ├── brand.resolve.js
│   │   │   │   ├── brand.args.js
│   │   │   │   ├── brand.schema.js
│   │   │   │   ├── brand.types.js
│   │   │   │   └── brand.fields.js
│   │   │   ├── brand.validationSchemas.js
│   │   │   ├── brand.endpoints.roles.js
│   │   │   └── brand.controller.js
│   │   ├── User
│   │   │   ├── graphQL
│   │   │   │   ├── user.fields.js
│   │   │   │   ├── user.resolve.js
│   │   │   │   └── user.types.js
│   │   │   ├── user.endpoints.roles.js
│   │   │   └── user.controller.js
│   │   ├── Category
│   │   │   ├── graphQL
│   │   │   │   ├── category.args.js
│   │   │   │   └── category.types.js
│   │   │   ├── category.endpoints.roles.js
│   │   │   └── category.controller.js
│   │   ├── Auth
│   │   │   ├── auth.endpoints.roles.js
│   │   │   └── auth.controller.js
│   │   ├── Review
│   │   │   ├── graphQL
│   │   │   │   ├── review.resolve.js
│   │   │   │   └── review.types.js
│   │   │   ├── review.endpoints.roles.js
│   │   │   └── review.controller.js
│   │   ├── Sub-category
│   │   │   ├── graphQL
│   │   │   │   ├── sub-category.fields.js
│   │   │   │   ├── sub-category.resolve.js
│   │   │   │   └── sub-category.types.js
│   │   │   ├── sub-category.endpoints.roles.js
│   │   │   └── sub-category.controller.js
│   │   ├── Order
│   │   │   ├── graphQL
│   │   │   │   ├── order.args.js
│   │   │   │   ├── order.schema.js
│   │   │   │   ├── order.types.js
│   │   │   │   └── order.fields.js
│   │   │   ├── order.endpoints.roles.js
│   │   │   └── order.controller.js
│   │   ├── Coupon
│   │   │   ├── graphQL
│   │   │   │   ├── coupon.types.js
│   │   │   │   ├── coupon.args.js
│   │   │   │   └── coupon.resolve.js
│   │   │   ├── coupon.endpoints.roles.js
│   │   │   └── coupon.controller.js
│   │   ├── Cart
│   │   │   ├── graphQL
│   │   │   │   ├── cart.types.js
│   │   │   │   └── cart.resolve.js
│   │   │   ├── cart.validationSchemas.js
│   │   │   ├── cart.endpoints.roles.js
│   │   │   └── cart.controller.js
│   │   └── index.routes.js
│   ├── payment-handler
│   │   └── stripe.js
│   ├── middlewares
│   │   ├── auth.middleware.js
│   │   ├── rollback-uploaded-files.middleware.js
│   │   ├── multer.middleware.js
│   │   ├── rollback-saved-documents.middleware.js
│   │   └── validation.middleware.js
│   └── utils
│       ├── pdf-kit.js
│       ├── general.validation.rule.js
│       └── generateOTP.js
└── index.js

```

### Getting Started 🏁

1. **Prerequisites:**
   * NodeJS (v20.10.0) 
   * NPM or Yarn (for package management)

2. **Installation:**
   * Clone the repository.
   * Navigate to the project directory.
   * Run `npm install` or `yarn install`.
   * Rename `dev.config.env.example` to `dev.config.env`
   * Fill the environment variables in `dev.config.env`.

3. **Running the application:**
   * Run `npm run dev` or `yarn dev` to start the development server.

### API Documentation 📝

Detailed API documentation, including endpoints, request parameters, and response formats, is provided within the Postman Collection, available at the project's homepage.

### Contributions  🤝

Contributions are always welcome! Feel free to open issues, pull requests, or share your ideas.

### License 📄

This project is licensed under the ISC license - see the [LICENSE](LICENSE) file for details.

Let's build a great E-commerce project! 😄
