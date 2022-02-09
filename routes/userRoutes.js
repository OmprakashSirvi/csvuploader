const express = require('express');
const multer = require('multer');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// create Router class
const router = express.Router();
// Uploaded csv is stored here
const upload = multer({ dest: './public/data' });

/**
 * different routes
 */
// login route
router.post('/login', authController.login);

// Post and get route {host}/user
router
  .route('/')
  .post(upload.single('data'), userController.addUsers)
  .get(authController.protect, userController.getUsers);

// From here on all the route is protected i.e authorisation is required
router.use(authController.protect);

// get the current user logged in
router.get('/getMe', userController.getMe);

// routes to perform CRUD operations on users
router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deactivateUser);
/**
 * NOTE : Here on delete route the user is not deleted from the database 
 *        but its property {active : false} is set 
 */
router.delete('/:id/delete', userController.deleteUser)
// export router to app as "userRoutes"
module.exports = router;
