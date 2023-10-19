const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const yup = require("yup");
const shortid = require("shortid");
const monk = require("monk");

require("dotenv").config();
const db = monk(process.env.MONGO_URI);
const urls = db.get("urls");
urls.createIndex("name");


const app = express();

app.use(morgan('tiny'));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static("./public"));

const schema = yup.object().shape({
    slug: yup.string().trim().matches(/[\w\-]/i),
    url: yup.string().trim().url().required(),

});

app.get("/url/:id", (req, res) => {
  // create a short url
});

app.get("/:id", async(req, res) => {
  // redirect to url
  const {id: slug} = req.params;
  try{
    const url = await urls.findOne({slug});
    if(url){
        res.redirect(url.url);
    } else{
        res.redirect(`/?error=${slug} not found`);
    }
  } catch(error){
     res.redirect(`/?error=Link not found`);
  }

})

app.post("/url", async (req, res, next) => {
    let slug = req.body.slug;
    const {url} = req.body;
    try{
        await schema.validate({
            slug,
            url,
        });

         if (!slug) {
            slug = shortid.generate();
         } else {
            const existing = await urls.findOne({slugs});
            if(existing){
                throw new Error("Slug already in use");
            }
         }
        slug = slug.toLowerCase();
        const newUrl = {
            url,
            slug,
        };
        const created = await urls.insert(newUrl);
        res.json(created);
    } catch(error){
        next(error);
    }

    app.use((error, req, res, next) => {
        if(error.status){
            res.status(error.status);
        } else{
            res.status(500);
        }
        res.json({        
            message: error.message,
            stack: process.env.NODE_ENV === "production" ? "": error.stack,
        });
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("listening at http://localhost:" + port);
})