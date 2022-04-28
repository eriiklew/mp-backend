const router = require('express').Router();
const {
  addStore,
  AddStoreAfter,
  storeInfo,
  validateSlug,
  getStoreBySlug,
  designs,
  singleDesign,
  addDesign,
  singleDesignProducts,
  updateDesign,
  updateDesignProducts,
  updateStoreData,
  updateDesignName,
} = require('../controller/store');
const auth = require('../middleware/auth');
const { upload, uploadBase64, generatePresignedURLs } = require('../middleware/multer');

router.route('/').post(auth, addStore);
router.route('/add-store-after').post(auth, AddStoreAfter);

// router.route('/validate-slug/:slug').get(validateSlug);
router.route('/validate-slug').post(validateSlug);
router.route('/designs').get(auth, designs);
router.route('/design/:designId').get(auth, singleDesign);
router.route('/design/:designId/').put(
  auth,
  upload.fields([
    { name: '3600x3600', maxCount: 1 },
    { name: '2700x2700', maxCount: 1 },
    { name: '1050x1050', maxCount: 1 },
    { name: '879x1833', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  updateDesign,
);
router.route('/design/:designId/name').put(auth, updateDesignName);

router.route('/design/products/:designId').get(singleDesignProducts);
router.route('/design/products/:designId').put(auth, updateDesignProducts);
router.route('/add-design').post(
  auth,
  upload.fields([
    { name: '3600x3600', maxCount: 1 },
    { name: '2700x2700', maxCount: 1 },
    { name: '1050x1050', maxCount: 1 },
    { name: '879x1833', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  addDesign,
);
router.route('/').get(auth, storeInfo);
router.route('/:slug').get(getStoreBySlug);
router.route('/update-store-data').put(
  auth,
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'coverAvatar', maxCount: 1 },
  ]),
  updateStoreData,
);

module.exports = router;
