# My People Server

## Introduction

My People Server is the backend component of the My People project, 
a family-oriented social network designed to help users organize family activities, share photos, and strengthen ties with their loved ones. 
This server handles the core functionality of the application, including user authentication, event management, and photo sharing.

## Technologies

My People Server is built using the JavaScript stack, with a focus on the following technologies:

1. **Node.js**: Used for server-side development.
2. **Express.js**: Employed as the web application framework for routing and middleware.
3. **MongoDB**: Provides the database for storing user and group information, events, projects and photos.
4. **Mongoose**: Used as an ODM (Object-Document Mapping) for MongoDB.
5. **JSON Web Tokens (JWT)**: Utilized for secure authentication and authorization.
6. **Nodemailer**: For email sending.
7. **Cloudinary**: Used for uploading images.
8. **Multer**: Handles the upload of images.
9. **Multer-storage-cloudinary**: A multer storage engine for Cloudinary.
10. **Bcryptjs**: Used for hashing passwords before saving them in the database.

## Setup

To set up My People Server locally :

```
$ git clone https://github.com/SilvRay/my-people-server.git
$ cd my-people-server
$ npm install
$ npm run dev
```

## Configuration
In `.env` are config values:
```
PORT=5005
ORIGIN=http://localhost:3000
TOKEN_SECRET=*****-*****-*****
SMTP_URI=smtp://localhost:1025/?pool=true&ignoreTLS=true
CLOUDINARY_NAME=*****-*****-*****
CLOUDINARY_KEY=*****-*****-*****
CLOUDINARY_SECRET=*****-*****-*****
APIKey2=*****-*****-*****
MONGODB_URI=mongodb://127.0.0.1:27017/my-people-server
```

Customize your values inside `.env`

## Co-worker
@[nicolasmeot](https://github.com/nicolasmeot)

## License
This project is licensed under the MIT License.

## Contact
If you have any questions or suggestions, feel free to contact me:

Email: alirayane14@gmail.com
