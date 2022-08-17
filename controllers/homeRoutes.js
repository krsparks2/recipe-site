const router = require('express').Router();
const { Recipe, User } = require('../models');
const withAuth = require('../utils/auth');
// const multer  = require('multer')
// const upload = multer({ dest: 'uploads/' })

router.get('/', async (req, res) => {
  try {
    // Get all recipes and JOIN with user data
    const recipeData = await Recipe.findAll({
      include: [
        {
          model: User,
          attributes: ['name'],
        },
      ],
    });

    // Serialize data so the template can read it
    const recipes = recipeData.map((recipe) => recipe.get({ plain: true }));

    // Pass serialized data and session flag into template
    res.render('homepage', { 
      recipes, 
      logged_in: req.session.logged_in 
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/recipe/:id', async (req, res) => {
  try {
    const recipeData = await Recipe.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['name'],
        },
      ],
    });

    const recipe = recipeData.get({ plain: true });

    res.render('recipe', {
      ...recipe,
      logged_in: req.session.logged_in
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Use withAuth middleware to prevent access to route
router.get('/profile', withAuth, async (req, res) => {
  try {
    // Find the logged in user based on the session ID
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Recipe }],
    });

    const user = userData.get({ plain: true });

    res.render('profile', {
      ...user,
      logged_in: true
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/login', (req, res) => {
  // If the user is already logged in, redirect the request to another route
  if (req.session.logged_in) {
    res.redirect('/profile');
    return;
  }
  res.render('login');
});

// var storage = multer.diskStorage({
//   destination: (req, file, callBack) => {
//       callBack(null, './public/images/')     // './public/images/' directory name where save the file
//   },
//   filename: (req, file, callBack) => {
//       callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
//   }
// })

// var uploadImage = multer({
//   storage: storage
// });

// app.get('/profile', (req, res) => {
// res.sendFile(__dirname + '/index.html');
// });

// app.post("/post", uploadImage.single('image'), (req, res) => {
//   if (!req.file) {
//       console.log("No file upload");
//   } else {
//       console.log(req.file.filename)
//       var imgsrc = 'http://127.0.0.1:3000/images/' + req.file.filename
//       var insertData = "INSERT INTO recipe_db(file_src)VALUES(recipe_images)"
//       db.query(insertData, [imgsrc], (err, result) => {
//           if (err) throw err
//           console.log("file uploaded")
//       })
//   }
// });


module.exports = router;
