const Store = require('../models/store');
const Designs = require('../models/design');
const {
  generatePresignedURLs,
  generateDesignPresignedURLs,
  generateProfileUrls,
} = require('../utils/generateUrls');

const addStore = async (req, res) => {
  try {
    const canvasMode = req.body.canvasModes;
    const urls = generatePresignedURLs(canvasMode);
    const data = {
      name: req.body.name,
      design: {
        designName: req.body.designName,
      },
      urls: urls.getUrls,
      products: JSON.parse(req.body.products),
      themeColor: req.body.themeColor,
      shapes: req.body.shapes,
      mobileBackgroundImage: req.body.mobileBackgroundImage,
      canvasModes: req.body.canvasModes,
    };

    const store = await Store.createStoreAndEssence(req.userData, data);
    res.status(200).json({
      data: {
        store,
        urls: urls.putUrls,
      },
      message: 'Store created successfully',
    });
  } catch (error) {
    console.log('addStore', error.message);
    res.status(400).json({ message: error.message });
  }
};
const AddStoreAfter = async (req, res) => {
  console.log('add store after', req.body);
  try {
    const urls = generateProfileUrls();
    const data = {
      name: req.body.name,
      urls: urls.getUrls,
      themeColor: req.body.themeColor,
      socialHandles: {
        tiktok: req.body.tiktok,
        instagram: req.body.instagram,
        youtube: req.body.youtube,
        twitch: req.body.twitch,
      },
      shapes: req.body.shapes,
    };
    const store = await Store.createStoreAndEssenceAfter(req.userData, data);

    res.status(200).json({
      data: {
        store,
        urls: urls.putUrls,
      },
      message: 'Store created successfully',
    });
  } catch (error) {
    console.log('addStore error', error.message);
    res.status(400).json({ message: error.message });
  }
};
/**
 *
 * @modelFunc {getLabeledInfo} it will always be the naming convention for the functions on
 * get request to get models info plus all associations with enums mapped
 * @param {storeId} mongoDB _id of store
 */
const storeInfo = async (req, res) => {
  try {
    const store = await Store.getLabeledInfo(req.userData._id);

    res.status(200).json({ store });
  } catch (error) {
    console.log('storeInfo', error.message);
    res.status(400).json({ message: error.message });
  }
};

const validateSlug = async (req, res) => {
  try {
    const { storeName } = req.body;

    if(storeName == 'feedback') {
      throw new Error('Cannot name store feedback')
    }

    if(storeName == 'blog') {
      throw new Error('Cannot name store blog')
    }

    const store = await Store.ValidateStoreSlug(storeName);

    if (store) {
      throw new Error('Store name already taken');
    }
    res.status(200).json({ message: 'valid' });
  } catch (error) {
    console.log('validateSlug', error.message);
    res.status(400).json({ message: error.message });
  }
};
// const validateSlug = async (req, res) => {
//   try {
//     const store = await Store.findOne({ slug: decodeURI(req.params.slug) });

//     if (store) {
//       throw new Error('Slug already taken');
//     }
//     res.status(200).json({ message: 'valid' });
//   } catch (error) {
//     console.log('validateSlug', error.message);
//     res.status(400).json({ message: error.message });
//   }
// };

const getStoreBySlug = async (req, res) => {
  try {
    const store = await Store.getLabeledInfoBySlug(req.params.slug);
    res.status(200).json({ store });
  } catch (error) {
    console.log('storeInfo', error.message);
    res.status(400).json({ message: error.message });
  }
};

const designs = async (req, res) => {
  try {
    const designs = await Store.getDesigns(req.userData.vendorId);
    res.status(200).json({ designs });
  } catch (e) {
    console.log('designs', e.message);
    res.status(400).json({ message: e.message });
  }
};

const addDesign = async (req, res) => {
  try {
    console.log('Request : ', req.body);
    const canvasModes = req.body.canvasModes;

    const urls = generateDesignPresignedURLs(canvasModes);
    const response = urls.putUrls;

    req.body = {
      ...req.body,
      urls: urls.getUrls,
    };
    const design = await Store.createDesign(req, req.userData.vendorId);

    res.status(200).json({ response, message: 'success' });
  } catch (error) {
    console.log('addDesign', error.message);
    res.status(400).json({ message: error.message });
  }
};

const singleDesign = async (req, res) => {
  try {
    const design = await Store.getSingleDesign(req.params.designId);
    res.status(200).json({ design });
  } catch (error) {
    console.log('singleDesign', error.message);
    res.status(400).json({ message: error.message });
  }
};

const singleDesignProducts = async (req, res) => {
  try {
    const design = await Store.getSingleDesignProducts(req.params.designId);
    res.status(200).json({ design });
  } catch (error) {
    console.log('singleDesignProducts', error.message);
    res.status(400).json({ message: error.message });
  }
};

const updateDesign = async (req, res) => {
  try {
    console.log('Request : ', req.body);
    const canvasModes = req.body.canvasModes;
    const urls = generateDesignPresignedURLs(canvasModes);

    req.body = {
      ...req.body,
      urls: urls.getUrls,
    };

    // const design = await Designs.updateDesign(req.params.designId, req.body.design);
    const design = await Designs.updateDesign(req.params.designId, req);

    const response = urls.putUrls;

    res.status(200).json({ response });
  } catch (error) {
    console.log('updateDesign', error.message);
    res.status(400).json({ message: error.message });
  }
};

const updateDesignName = async (req, res) => {
  try {
    const design = await Designs.updateDesignName(req.params.designId, req.body.designName);
    res.status(200).json({ design });
    console.log('design name ');
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateDesignProducts = async (req, res) => {
  try {
    const design = await Store.updateDesign(req.params.designId, req.userData.vendorId, req.body);
    res.status(200).json({ design });
  } catch (error) {
    console.log('updateDesignProducts', error.message);
    res.status(400).json({ message: error.message });
  }
};

const updateStoreData = async (req, res) => {
  try {
    const store = await Store.findById(req.body.storeId);

    const data = {
      storeId: req.body.storeId,
      name: req.body.name,
      slug: req.body.name.replace(/\s+/g, '-').toLowerCase(),
      logo: req.files.logo ? req.files.logo[0].location : store.logo,
      coverAvatar: req.files.coverAvatar ? req.files.coverAvatar[0].location : store.coverAvatar,
      themeColor: req.body.themeColor ? req.body.themeColor : store.themeColor,
    };

    const updatedStore = await Store.updateStoreData(data);
    res.status(200).json({ updatedStore });
  } catch (error) {
    console.log('updateStoreData', error.message);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  addStore,
  AddStoreAfter,
  storeInfo,
  validateSlug,
  getStoreBySlug,
  designs,
  addDesign,
  singleDesign,
  singleDesignProducts,
  updateDesign,
  updateDesignProducts,
  updateStoreData,
  updateDesignName,
};
