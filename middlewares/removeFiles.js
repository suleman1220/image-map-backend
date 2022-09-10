const fs = require('fs');

module.exports = (req, res, next) => {
  if (fs.existsSync('images/uploaded-img.jpg'))
    fs.unlinkSync('images/uploaded-img.jpg');
  if (fs.existsSync('images/uploaded-img.png'))
    fs.unlinkSync('images/uploaded-img.png');
  if (fs.existsSync('images/uploaded-img.jpeg'))
    fs.unlinkSync('images/uploaded-img.jpeg');
  next();
};
