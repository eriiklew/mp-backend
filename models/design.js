const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * @field url
 * @description: Design Image's URL
 */

const designSchema = new mongoose.Schema(
  {
    vendorId: {
      type: ObjectId,
      ref: 'vendor',
      required: true,
    },
    vendorProductIds: {
      type: [ObjectId],
      ref: 'vendorProducts',
      required: true,
    },
    storeId: {
      type: ObjectId,
      ref: 'store',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // url: {
    //   type: String,
    //   required: true,
    // },
    frontDesign: {
      type: Object,
      required: true,
    },
    backDesign: {
      type: Object,
      required: true,
    },
    // designImages: {
    //   type: [Object],
    //   required: true,
    // },
    // designJson: {
    //   type: String,
    //   // required: true,
    // },
  },
  { timestamps: true },
);

designSchema.statics.updateDesign = async function (designId, req) {
  const data = req.body;

  let frontDesignImages, backDesignImages;
  const canvasModes = data.canvasModes;

  if (canvasModes.front == false && canvasModes.back == true) {
    frontDesignImages = data.urls.filter((design, idx) => idx < 3);
    backDesignImages = data.urls.filter((design, idx) => idx > 2 && idx < data.urls.length - 1);
  } else if (canvasModes.front == true && canvasModes.back == false) {
    frontDesignImages = data.urls.filter((design, idx) => idx < 5);
    backDesignImages = [];
  } else if (canvasModes.front == true && canvasModes.back == true) {
    frontDesignImages = data.urls.filter((design, idx) => idx < 5);
    backDesignImages = data.urls.filter((design, idx) => idx > 5 && idx < data.urls.length - 1);
  }

  const frontDesignJson = data.urls.find(el => el.name === 'front-design.json');
  const backDesignJson = data.urls.find(el => el.name === 'back-design.json');

  console.log('Shapes: ', data.shapes);
  const updatedFields = {
    frontDesign: {
      designJson: frontDesignJson?.imageUrl || '',
      designImages: frontDesignImages,
      shape: data.shapes.front,
      mobileBackgroundImage: data.mobileBackgroundImage.front,
    },
    backDesign: {
      designJson: backDesignJson?.imageUrl || '',
      designImages: backDesignImages,
      shape: data.shapes.back,
      mobileBackgroundImage: data.mobileBackgroundImage.back,
    },
  };

  const design = await this.findByIdAndUpdate(
    designId,
    {
      $set: updatedFields,
    },
    { new: true },
  );

  return design;
};

designSchema.statics.updateDesignName = async function (designId, designName) {
  const design = await this.findByIdAndUpdate(
    designId,
    {
      $set: {
        name: designName,
      },
    },
    { new: true },
  );

  return design;
};

module.exports = mongoose.model('design', designSchema);
