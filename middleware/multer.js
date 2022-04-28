const multer = require('multer');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const BUCKET_NAME = 'merchpals-mvp';
// const BUCKET_NAME = 'dummy-merchpals';

aws.config.update({
  accessKeyId: 'AKIAWUDRFMMZSL2ATNGU',
  secretAccessKey: 'gVr6A976ziFZhfXDFH1kYIche731om7UcQPwDrMY',
  region: 'us-east-2',
  // region: 'us-east-1',
});

const makeid = length => {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const upload = multer({
  storage: multerS3({
    s3: new aws.S3(),
    bucket: BUCKET_NAME,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, 'stores/' + req.userData._id + '/' + file.originalname + '-' + makeid(10));
    },
  }),
});

const signatures = {
  JVBERi0: 'application/pdf',
  R0lGODdh: 'image/gif',
  R0lGODlh: 'image/gif',
  iVBORw0KGgo: 'image/png',
  '/9j/': 'image/jpg',
};

const detectMimeType = b64 => {
  for (var s in signatures) {
    if (b64.indexOf(s) === 0) {
      return signatures[s];
    }
  }
};

const uploadBase64 = async (req, res, next) => {
  console.log('uploadBase64');
  const design = JSON.parse(req.body.design);
  const designImages = design.designImages;

  var s3Bucket = new aws.S3();

  for (let i = 0; i < designImages.length; i++) {
    const base64Data = designImages[i].data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const mimeType = detectMimeType(base64Data);
    const params = {
      Bucket: BUCKET_NAME,
      Key: `designs/${req.userData._id}/${designImages[i].name}-${makeid(10)}`,
      Body: buffer,
      ContentEncoding: 'base64',
      ContentType: mimeType,
    };
    try {
      const { Location } = await s3Bucket.upload(params).promise();

      delete designImages[i].data;
      designImages[i] = {
        ...designImages[i],
        imageUrl: Location,
      };
      // update the image in designImage array

      // designImages[image] = image;
    } catch (error) {
      console.log('uploadBase64', error.message);
    }
  }

  req.body.design = {
    ...design,
    designImages,
  };

  // buf = Buffer.from(design.base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  // var s3Bucket = new aws.S3();

  // var data = {
  //   Bucket: BUCKET_NAME,
  //   Key: `designs/${req.userData._id}/${design.name}`,
  //   Body: buf,
  //   ContentEncoding: 'base64',
  //   ContentType: detectMimeType(design.base64Image),
  // };

  // try {
  //   const { Location } = await s3Bucket.upload(data).promise();
  //   delete design.base64Image;
  //   req.body.design = {
  //     imageUrl: Location,
  //     ...design,
  //   };
  // } catch (error) {
  //   console.log(error);
  // }

  next();
};

const generatePresignedURLs = async (req, res, next) => {
  const s3 = new aws.S3({
    accessKeyId: 'AKIAWUDRFMMZSL2ATNGU',
    secretAccessKey: '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',
    region: 'us-east-1',
    Bucket: BUCKET_NAME,
    signatureVersion: 'v4',
  });

  // getUrls to be stored in the db
  const getLogoURL = s3.getSignedUrl('getObject', {
    Bucket: BUCKET_NAME,
    Key: `uploads/${req.userData._id}/logo.png`,
  });

  const getLoverAvatarURL = s3.getSignedUrl('getObject', {
    Bucket: BUCKET_NAME,
    Key: `uploads/${req.userData._id}/coverAvatar.png`,
  });

  const getDesignVariant1URL = s3.getSignedUrl('getObject', {
    Bucket: BUCKET_NAME,
    Key: `uploads/${req.userData._id}/designVariant1.png`,
  });

  const getDesignVariant2URL = s3.getSignedUrl('getObject', {
    Bucket: BUCKET_NAME,
    Key: `uploads/${req.userData._id}/designVariant2.png`,
  });

  const getDesignVariant3URL = s3.getSignedUrl('getObject', {
    Bucket: BUCKET_NAME,
    Key: `uploads/${req.userData._id}/designVariant3.png`,
  });

  const getDesignVariant4URL = s3.getSignedUrl('getObject', {
    Bucket: BUCKET_NAME,
    Key: `uploads/${req.userData._id}/designVariant4.png`,
  });

  const getDesignVariant5URL = s3.getSignedUrl('getObject', {
    Bucket: BUCKET_NAME,
    Key: `uploads/${req.userData._id}/designVariant5.png`,
  });

  const getDesignJsonURL = s3.getSignedUrl('getObject', {
    Bucket: BUCKET_NAME,
    Key: `uploads/${req.userData._id}/design.json`,
  });

  // putUrls to be sent to the frontend where PUT request is made

  const putLogoURL = s3.getSignedUrl('putObject', {
    Bucket: BUCKET_NAME,
    Key: `uploads/${req.userData._id}/logo.png`,
    Expires: 600 * 5,
    ContentType: 'image/png',
  });

  const putCoverAvatarURL = s3.getSignedUrl('putObject', {
    Bucket: BUCKET_NAME,
    Key: `uploads/${req.userData._id}/coverAvatar.png`,
    Expires: 600 * 5,
    ContentType: 'image/png',
  });

  const putDesignVariant1URL = s3.getSignedUrl('putObject', {
    Bucket: BUCKET_NAME,
    Key: `uploads/${req.userData._id}/designVariant1.png`,
    Expires: 600 * 5,
    ContentType: 'image/png',
  });

  const putDesignVariant2URL = s3.getSignedUrl('putObject', {
    Bucket: BUCKET_NAME,
    Key: `uploads/${req.userData._id}/designVariant2.png`,

    Expires: 600 * 5,
    ContentType: 'image/png',
  });

  const putDesignVariant3URL = s3.getSignedUrl('putObject', {
    Bucket: BUCKET_NAME,
    Key: `uploads/${req.userData._id}/designVariant3.png`,
    Expires: 600 * 5,
    ContentType: 'image/png',
  });

  const putDesignVariant4URL = s3.getSignedUrl('putObject', {
    Bucket: BUCKET_NAME,
    Key: `uploads/${req.userData._id}/designVariant4.png`,
    Expires: 600 * 5,
    ContentType: 'image/png',
  });

  const putDesignVariant5URL = s3.getSignedUrl('putObject', {
    Bucket: BUCKET_NAME,
    Key: `uploads/${req.userData._id}/designVariant5.png`,
    Expires: 600 * 5,
    ContentType: 'image/png',
  });

  const putDesignJsonURL = s3.getSignedUrl('putObject', {
    Bucket: BUCKET_NAME,
    Key: `uploads/${req.userData._id}/design.json`,
    Expires: 600 * 5,
    ContentType: 'application/json',
  });

  req.body.URLS = {
    putUrls: {
      logo: putLogoURL,
      coverAvatar: putCoverAvatarURL,
      variant1: putDesignVariant1URL,
      variant2: putDesignVariant2URL,
      variant3: putDesignVariant3URL,
      variant4: putDesignVariant4URL,
      variant5: putDesignVariant5URL,
      designJson: putDesignJsonURL,
    },
    getUrls: {
      logo: getLogoURL,
      coverAvatar: getLoverAvatarURL,
      variant1: getDesignVariant1URL,
      variant2: getDesignVariant2URL,
      variant3: getDesignVariant3URL,
      variant4: getDesignVariant4URL,
      variant5: getDesignVariant5URL,
      designJson: getDesignJsonURL,
    },
  };

  console.log(req.body.URLS.getUrls);

  next();
};

module.exports = {
  upload,
  uploadBase64,
  generatePresignedURLs,
};
