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

//Get Single Partner
router.get("/Get_SinglePartner/:wd_id", (req, res, next) => {
    const { wd_id } = req.params;

    models.partners
        .findAll({
            where: {
                id: wd_id,
            }
        })

        .then((data) => {
            if (data?.length != 0) {
                console.log("Partner Get Successfully");
                res.json({
                    data: data,
                    successful: true,
                    message: "Partner Get Successfully",
                });
            } else {
                console.log("No Partner Found");
                res.json({
                    successful: false,
                    message: "No Partner Found",
                });
            }
        })

        .catch(function (err) {
            console.log("Failed To Get Partner: ", err);
            res.json({
                successful: false,
                message: "Failed To Get Partner: " + err,
            });
        });
});

//Get All Partners
router.get("/Get_AllPartners", (req, res, next) => {
    models.partners
        .findAll({
            order: [["created_at", "DESC"]],
        })
        .then((data) => {
            if (data?.length > 0) {
                console.log("Get All Partners Successfully");
                res.json({
                    data: data,
                    successful: true,
                    message: "Get All Partners Successfully",
                });
            } else {
                console.log("No Partners Found");
                res.json({
                    successful: false,
                    message: "No Partners Found",
                });
            }
        })
        .catch(function (err) {
            console.log("Failed To Get All Partners: ", err);
            res.json({
                successful: false,
                message: "Failed To Get All Partners: " + err,
            });
        });
});

//Create Partner
router.post("/Create_Partner", async (req, res, next) => {
    const { 
        url,
        image,

    } = req.body.data;

    values = [
        {
            image : req.body.data.image,
            url : req.body.data.url,
            created_at: new Date().toISOString(),
        },
    ];
    await models.partners
        .findAll({
            where: {
                image: values[0].image,
            },
        })
        .then((data) => {
            if (data?.length !== 0) {
                console.log("Partner already exists");
                res.json({
                    successful: false,
                    message: "Partner already exists",
                });
            } else {
                models.partners
                    .bulkCreate(values)
                    .then((x) => {
                        if (x?.length !== 0) {
                            const accessToken = jwt.sign(
                                {
                                    successful: true,
                                    message: "Partner Created Successfully",
                                    data: x[0],
                                },
                                accessTokenSecret
                            );
                            res.json({
                                successful: true,
                                message: "Partner Created Successfully",
                                data: x[0].id,
                            });
                        }
                    })
                    .catch(function (err) {
                        console.log("Failed to Create New Partner: ", err);
                        res.json({
                            successful: false,
                            message: "Failed to Create New Partner: " + err,
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

//Update Partner Detail
router.post("/Update_PartnerDetail", async (req, res, next) => {
    console.log("Update Partner Detail API Calling:", req.body.data);
    values = [
        {
            id: req.body.data.id,
            image : req.body.data.image,
            url: req.body.data.url,
            
        },
    ];
    await models.partners
        .update(
            {
                image : values[0].image,
                url : values[0].url,
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
                    message: "Partner Detail Updated Successfully",
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


//Update Partner Pic
router.post("/Update_PartnerPic", async (req, res, next) => {
    console.log("Update Partner Pic API Calling", req.body.data);
   
    values = [
        {
            id: req.body.data.id,
            image: req.body.data.image,
        },
    ];
    await models.partners
        .update(
            {
                image: values[0].image,
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
                    message: "Partner Pic Updated Successfully",
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
        cb(null, "./PartnersImages");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

//Upload Partner Pic
var upload = multer({ storage: storage }).single("file");
router.post("/PartnerPic", function (req, res) {
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


//Delete Single Partner
router.get("/Delete_SinglePartner/:id", (req, res, next) => {
    const { id } = req.params;
  
    models.partners
      .destroy({
        where: {
          id: id,
        },
      })
      .then((data) => {
        if (data?.length > 0) {
          console.log("Partner Deleted Successfully.");
          res.json({
            data: data,
            successful: true,
            message: "Partner Deleted Successfully.",
          });
        } else {
          console.log("No Partner Found");
          res.json({
            successful: false,
            message: "No Partner Found",
          });
        }
      })
      .catch(function (err) {
        console.log("Failed To Delete Partner: ", err);
        res.json({
          successful: false,
          message: "Failed To Delete Partner: " + err,
        });
      });
  });


module.exports = router;