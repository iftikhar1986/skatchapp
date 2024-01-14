const express = require("express");
const router = express.Router();
const models = require("../models/models");
const sequelize = require("sequelize");
const Op = sequelize.Op;
const jwt = require("jsonwebtoken");
const {
    accessTokenSecret,
} = require("../config");
const multer = require("multer");

//Get Single Story
router.get("/Get_SingleStory/:stry_id", (req, res, next) => {
    const { stry_id } = req.params;

    models.stories
        .findAll({
            where: {
                id: stry_id,
            }
        })

        .then((data) => {
            if (data?.length != 0) {
                console.log("Story Get Successfully");
                res.json({
                    data: data,
                    successful: true,
                    message: "Story Get Successfully",
                });
            } else {
                console.log("No Story Found");
                res.json({
                    successful: false,
                    message: "No Story Found",
                });
            }
        })

        .catch(function (err) {
            console.log("Failed To Get Story: ", err);
            res.json({
                successful: false,
                message: "Failed To Get Story: " + err,
            });
        });
});

//Get All Stories
router.get("/Get_AllStories", (req, res, next) => {
    models.stories
        .findAll({
            order: [["created_at", "DESC"]],
        })
        .then((data) => {
            if (data?.length > 0) {
                console.log("Get All Stories Successfully");
                res.json({
                    data: data,
                    successful: true,
                    message: "Get All Stories Successfully",
                });
            } else {
                console.log("No Stories Found");
                res.json({
                    successful: false,
                    message: "No Stories Found",
                });
            }
        })
        .catch(function (err) {
            console.log("Failed To Get All Stories: ", err);
            res.json({
                successful: false,
                message: "Failed To Get All Stories: " + err,
            });
        });
});

//Create Story
router.post("/Create_Story", async (req, res, next) => {
    const { thumbnail, url, titleEn, titleAr,  titleFr, is_active , type} = req.body.data;

    values = [
        {
            thumbnail: req.body.data.thumbnail,
            url: req.body.data.url,
            titleFr: req.body.data.titleFr,
            titleAr: req.body.data.titleAr,
            titleEn: req.body.data.titleEn,           
            is_active: req.body.data.is_active,
            type: req.body.data.type,
            created_at: new Date().toISOString(),
        },
    ];
    await models.stories
        .findAll({
            where: {
                titleAr: values[0].titleAr,
            },
        })
        .then((data) => {
            if (data?.length !== 0) {
                console.log("Commonly Used Sign already exists");
                res.json({
                    successful: false,
                    message: "Commonly Used Sign already exists",
                });
            } else {
                models.stories
                    .bulkCreate(values)
                    .then((x) => {
                        if (x?.length !== 0) {
                            const accessToken = jwt.sign(
                                {
                                    successful: true,
                                    message: "Commonly Used Sign Created Successfully",
                                    data: x[0],
                                },
                                accessTokenSecret
                            );
                            res.json({
                                successful: true,
                                message:  "Commonly Used Sign Created Successfully",
                                data: x[0].id,
                            });
                        }
                    })
                    .catch(function (err) {
                        console.log("Failed to Create New Commonly Used Sign: ", err);
                        res.json({
                            successful: false,
                            message: "Failed to Create New Commonly Used Sign: " + err,
                        });
                    });
            }
        })
        .catch(function (err) {
            console.log("Request Data is Empty: ", err);
            res.json({
                successful: false,
                message: "Request Data is Empty: " + err,
            });
        });
});

//Update Story Detail
router.post("/Update_StoryDetail", async (req, res, next) => {
    console.log("Update Story Detail API Calling:", req.body.data);
    values = [
        {
            id: req.body.data.id,
            thumbnail: req.body.data.thumbnail,
            url: req.body.data.url,
            titleEn: req.body.data.titleEn,
           titleAr: req.body.data.titleAr,
            titleFr: req.body.data.titleFr,
            is_active: req.body.data.is_active,
            type: req.body.data.type,
        },
    ];
    await models.stories
        .update(
            {
                thumbnail: values[0].thumbnail,
                url: values[0].url,
                titleEn: values[0].titleEn,
                titleAr: values[0].titleAr,
                titleFr: values[0].titleFr,
                is_active: values[0].is_active,
                type: values[0].type,
                updated_at: new Date().toISOString(),
            },
            {
                where: {
                    id: values[0].id,
                },
                returning: true,
                plain: true,
                exclude: ["created_at", "updated_at"],
            }
        )
        .then((data) => {
            const accessToken = jwt.sign(
                {
                    successful: true,
                    message: "Story Detail Updated Successfully",
                    data: data[1].dataValues,
                },
                accessTokenSecret
            );
            console.log("Response Data: ", data[1].dataValues);
            res.json({
                successful: true,
                message: "Successful",
                data: data[1].dataValues,
                accessToken,
            });
        })
        .catch(function (err) {
            console.log(err);
            res.json({
                message: "Failed" + err,
                successful: false,
            });
        });
});

//Update Story Status
router.post("/Update_Storiestatus", async (req, res, next) => {
    console.log("Update Story Status API calling", req.body.data);
    values = [
        {
            id: req.body.data.id,
            status: req.body.data.status,
        },
    ];
    await models.stories
        .update(
            {
                is_active: values[0].status,
                updated_at: new Date().toISOString(),
            },
            {
                where: {
                    id: values[0].id,
                },
                returning: true,
                exclude: ["created_at", "updated_at"],
            }
        )
        .then((data) => {
            const val = {
                id: values[0].id,
                is_active: values[0].status,
            };
            const accessToken = jwt.sign(
                {
                    successful: true,
                    message: "Story Status Updated Successfully",
                    data: val,
                },
                accessTokenSecret
            );
            console.log("val", val);
            res.json({
                successful: true,
                message: "Successful",
                data: val,
                accessToken,
            });
        })
        .catch(function (err) {
            console.log(err);
            res.json({
                message: "Failed" + err,
                successful: false,
            });
        });
});

//Update Story Pic
router.post("/Update_StoryPic", async (req, res, next) => {
    console.log("Update Story Pic API Calling", req.body.data);
   
    values = [
        {
            id: req.body.data.id,
            thumbnail: req.body.data.thumbnail,
        },
    ];
    await models.stories
        .update(
            {
                thumbnail: values[0].thumbnail,
                updated_at: new Date().toISOString(),
            },
            {
                where: {
                    id: values[0].id,
                },
                returning: true,
                plain: true,
                exclude: ["created_at", "updated_at"],
            }
        )
        .then((data) => {
            const accessToken = jwt.sign(
                {
                    successful: true,
                    message: "Story Pic Updated Successfully",
                    data: data[1].dataValues,
                },
                accessTokenSecret
            );
            res.json({
                successful: true,
                message: "Successful",
                data: data[1].dataValues,
                accessToken,
            });
        })
        .catch(function (err) {
            console.log(err);
            res.json({
                message: "Failed" + err,
                successful: false,
            });
        });
});

//Update Story Vid
router.post("/Update_StoryVid", async (req, res, next) => {
    console.log("Update Story Vid API Calling", req.body.data);
   
    values = [
        {
            id: req.body.data.id,
            url: req.body.data.url,
        },
    ];
    await models.stories
        .update(
            {
                url: values[0].url,
                updated_at: new Date().toISOString(),
            },
            {
                where: {
                    id: values[0].id,
                },
                returning: true,
                plain: true,
                exclude: ["created_at", "updated_at"],
            }
        )
        .then((data) => {
            const accessToken = jwt.sign(
                {
                    successful: true,
                    message: "Story Pic Updated Successfully",
                    data: data[1].dataValues,
                },
                accessTokenSecret
            );
            res.json({
                successful: true,
                message: "Successful",
                data: data[1].dataValues,
                accessToken,
            });
        })
        .catch(function (err) {
            console.log(err);
            res.json({
                message: "Failed" + err,
                successful: false,
            });
        });
});

//Setup Storage Folder
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./StoriesImages");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

//Upload Story Pic
var upload = multer({ storage: storage }).single("file");
router.post("/StoryPic", function (req, res) {
    console.log("Req:", req);
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.json(err);
        } else if (err) {
            return res.json(err);
        }
        return res.send(req.file);
    });
});

//Upload Story Vid
var upload = multer({ storage: storage }).single("file");
router.post("/StoryVid", function (req, res) {
    console.log("Req:", req);
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.json(err);
        } else if (err) {
            return res.json(err);
        }
        return res.send(req.file);
    });
});

//Delete Single Story
router.get("/Delete_SingleStory/:id", (req, res, next) => {
    const { id } = req.params;
  
    models.stories
      .destroy({
        where: {
          id: id,
        },
      })
      .then((data) => {
        if (data?.length > 0) {
          console.log("Story Deleted Successfully.");
          res.json({
            data: data,
            successful: true,
            message: "Story Deleted Successfully.",
          });
        } else {
          console.log("No Story Found");
          res.json({
            successful: false,
            message: "No Story Found",
          });
        }
      })
      .catch(function (err) {
        console.log("Failed To Delete Story: ", err);
        res.json({
          successful: false,
          message: "Failed To Delete Story: " + err,
        });
      });
  });


module.exports = router;