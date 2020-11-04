const express = require('express')
const captureWebsite = require('capture-website');

const app = express()

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get('/',(req,res) => {
    res.render("index")
})

app.post('/', (req, res) => {
    function getResolution(type) {
        if (type == "fullhd") {
          var IMG_WIDTH = 1920;
          var IMG_HEIGHT = 1080;
          return [IMG_WIDTH, IMG_HEIGHT];
        } else if (type == "hd") {
          var IMG_WIDTH = 1280;
          var IMG_HEIGHT = 720;
          return [IMG_WIDTH, IMG_HEIGHT];
        }
      }

      var options = {
        hideElements: ["#sidebar", "img.ad"],
        fullPage: req.body.fullPage ? true : false,
        type: `${req.body.fileType}`,
        width: getResolution(req.body.resolution)[0],
        height: getResolution(req.body.resolution)[1],
      };

      function getString(url) {
        url = url.replace(/(https?:\/\/)?(www.)?/i, "");
        if (url.indexOf("/") !== -1) {
          return url.split("/")[0];
        }
        return url;
      }

      var fileName = getString(req.body.url);

      console.log("taking screenshot");

      const screenshotImage = async () => {
        await captureWebsite
          .file(
            `${req.body.url}`,
            `${fileName}.${req.body.resolution}.${options.type}`,
            options
          )
          .catch((err) => {
              console.log(err)
          })
      };

      screenshotImage();

      res.redirect("/");
});

app.listen(3000, function() {
    console.log("server listening")
})

