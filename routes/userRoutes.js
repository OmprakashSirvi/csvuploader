const express = require('express');
const multer = require('multer');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();
const upload = multer({ dest: './public/data' });

router.post('/login', authController.login);

router
  .route('/')
  .post(upload.single('data'), userController.addUsers)
  .get(authController.protect, userController.getUsers);

router.use(authController.protect);

router.get('/getMe', userController.getMe);

router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deactivateUser);

module.exports = router;
