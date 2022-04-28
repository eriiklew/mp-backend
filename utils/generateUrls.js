const { v4: uuidv4 } = require('uuid');
const aws = require('aws-sdk');

aws.config.update({
  accessKeyId: process.env.AWS_MP_SYSTEM_ACCESS_ID,
  secretAccessKey: process.env.AWS_MP_SYSTEM_SECRET_KEY,
  region: process.env.AWS_S3_REGION,
});
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_MP_SYSTEM_ACCESS_ID,
  secretAccessKey: process.env.AWS_MP_SYSTEM_SECRET_KEY,
  region: process.env.AWS_S3_REGION,
  Bucket: process.env.AWS_S3_DESIGN_BUCKET,
  signatureVersion: 'v4',
});

const generatePresignedURLs = canvasModes => {
  const bothModes = canvasModes.front == true && canvasModes.back == true;

  const id = uuidv4();
  let urlNames = ['logo.png', 'cover-avatar.png'];
  if (canvasModes.front == true && canvasModes.back == false) {
    urlNames = [
      ...urlNames,
      'front-3600x3600.png',
      'front-2700x2700.png',
      'front-1050x1050.png',
      'front-879x1833.png',
      'front-thumbnail.png',
      'front-design.json',
    ];
  }
  if (canvasModes.back == true && canvasModes.front == false) {
    urlNames = [
      ...urlNames,
      'front-3600x3600.png',
      'front-1050x1050.png',
      'front-879x1833.png',
      'back-2700x2700.png',
      'back-thumbnail.png',
      'back-design.json',
    ];
  }
  if (canvasModes.front == true && canvasModes.back == true) {
    urlNames = [
      ...urlNames,
      'front-3600x3600.png',
      'front-2700x2700.png',
      'front-1050x1050.png',
      'front-879x1833.png',
      'front-thumbnail.png',
      'front-design.json',
      'back-2700x2700.png',
      'back-thumbnail.png',
      'back-design.json',
    ];
  }

  // if (bothModes) {
  //   urlNames = [...urlNames, 'back-2700x2700.png', 'back-thumbnail.png', 'back-design.json'];
  // }

  const getUrls = urlNames.map(name => {
    const URL = `https://${process.env.AWS_S3_DESIGN_BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${id}/${name}`;
    return {
      name,
      imageUrl: URL,
    };
  });

  const putUrls = urlNames.map(name => {
    const params = {
      Bucket: process.env.AWS_S3_DESIGN_BUCKET,
      Key: `${id}/${name}`,
      Expires: 60 * 5,
      ContentType: 'image/png',
    };

    const URL = s3.getSignedUrl('putObject', params);
    return {
      name,
      imageUrl: URL,
    };
  });

  const urls = {
    putUrls,
    getUrls,
  };

  return urls;
};

const generateDesignPresignedURLs = canvasModes => {
  const bothModes = canvasModes.front == true && canvasModes.back == true;

  const id = uuidv4();

  let urlNames = [];
  if (canvasModes.front == true && canvasModes.back == false) {
    urlNames = [
      ...urlNames,
      'front-3600x3600.png',
      'front-2700x2700.png',
      'front-1050x1050.png',
      'front-879x1833.png',
      'front-thumbnail.png',
      'front-design.json',
    ];
  }
  if (canvasModes.back == true && canvasModes.front == false) {
    urlNames = [
      ...urlNames,
      'front-3600x3600.png',
      'front-1050x1050.png',
      'front-879x1833.png',
      'back-2700x2700.png',
      'back-thumbnail.png',
      'back-design.json',
    ];
  }
  if (canvasModes.front == true && canvasModes.back == true) {
    urlNames = [
      ...urlNames,
      'front-3600x3600.png',
      'front-2700x2700.png',
      'front-1050x1050.png',
      'front-879x1833.png',
      'front-thumbnail.png',
      'front-design.json',
      'back-2700x2700.png',
      'back-thumbnail.png',
      'back-design.json',
    ];
  }

  const getUrls = urlNames.map(name => {
    const URL = `https://${process.env.AWS_S3_DESIGN_BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${id}/${name}`;
    return {
      name,
      imageUrl: URL,
    };
  });

  const putUrls = urlNames.map(name => {
    const params = {
      Bucket: process.env.AWS_S3_DESIGN_BUCKET,
      Key: `${id}/${name}`,
      Expires: 60 * 5,
      ContentType: 'image/png',
    };

    const URL = s3.getSignedUrl('putObject', params);
    return {
      name,
      imageUrl: URL,
    };
  });

  const urls = {
    putUrls,
    getUrls,
  };

  return urls;
};

const generateProfileUrls = () => {
  const id = uuidv4();

  const urlNames = ['logo.png', 'cover-avatar.png'];

  const getUrls = urlNames.map(name => {
    const URL = `https://${process.env.AWS_S3_DESIGN_BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${id}/${name}`;
    return {
      name,
      imageUrl: URL,
    };
  });

  const putUrls = urlNames.map(name => {
    const params = {
      Bucket: process.env.AWS_S3_DESIGN_BUCKET,
      Key: `${id}/${name}`,
      Expires: 60 * 5,
      ContentType: 'image/png',
    };

    const URL = s3.getSignedUrl('putObject', params);
    return {
      name,
      imageUrl: URL,
    };
  });

  const urls = {
    putUrls,
    getUrls,
  };

  return urls;
};
module.exports = {
  generatePresignedURLs,
  generateDesignPresignedURLs,
  generateProfileUrls,
};
