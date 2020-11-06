const { TIMEOUT } = require('dns');
const express = require('express');
const puppeteer = require('puppeteer');
const stream = require('stream')

const app = express();

app.set("view engine", "ejs");
app.use(express.static("assets"));
app.use(express.urlencoded({ extended: true }));



function getString(url) {
    url = url.replace(/(https?:\/\/)?(www.)?/i, "");
    if (url.indexOf("/") !== -1) {
      return url.split("/")[0];
    }
    return url;
  }

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


app.get('/',(req,res) => {
    res.render("index")
})

app.post('/', async (req, res) => {
  console.log(req.body)
  try{
    async function doScreenCapture(url) {
      try {
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0' })
        .catch((err) =>{
          console.log(err)
          res.render('index', { errormessage: 'Not a valid website please try again' });
          browser.close();
          return null;
        })
        await page.evaluate(() => {
          window.scrollBy(0, window.innerHeight);
        })  
        const screenshot = await page.screenshot({
          fullPage: req.body.fullPage ? true : false,
          type: `${req.body.fileType}`,
          width: getResolution(req.body.resolution)[0],
          height: getResolution(req.body.resolution)[1],
        });
        await browser.close();
        return screenshot;
      } catch (e) {
        console.log(e);
      }
    }

  const fileName = getString(req.body.url);
  const screenshot = await doScreenCapture(`${req.body.url}`)
  .catch((err) => {
    console.log(err)
  })
  let readStream = new stream.PassThrough();
  readStream.end(screenshot);
  res.set('Content-disposition', `attachment; filename=${fileName}.${req.body.fileType}`);
  res.set('Content-Type', 'image/${req.body.fileType}');
  return readStream.pipe(res);
  } catch (e) {
    console.log(e)
  }
})

app.listen(process.env.PORT || 3000, () => console.log("Started app"));