const { authSchema } = require('../validator/validate');

const Coupon = require('../databases/couponSchema');

exports.create = (req, res) => {
    authSchema
      .validateAsync(req.body)
      .then(result => {
        return Coupon.findById(req.body.OfferName);
      })
      .then(data => {
        if (!data) {
          const currentDate = new Date().getTime();
          const dateOne = new Date(req.body.EndDate).getTime();
          const currentStatus = currentDate < dateOne ? "Active" : "Inactive";
  
          const coupon = new Coupon({
            
            CouponCode: req.body.CouponCode,
            StartDate: req.body.StartDate,
            EndDate: req.body.EndDate,
            DiscountPercentage: req.body.DiscountPercentage,
            DiscountAmount: req.body.DiscountAmount,
            TermsAndCondition: req.body.TermsAndCondition,
            OfferPosterOrImage: req.body.OfferPosterOrImage,
            Status: currentStatus
          });
  
          return coupon.save();
        }
      })
      .then(savedCoupon => {
        if (savedCoupon) {
          res.send(savedCoupon);
        }
      })
      .catch(error => {
        res.status(409).json({ message: error?.message || error });
      });
  };
  

exports.findAll = (req, res) => {
  Coupon.find({})
    .sort({ _id: -1 })
    .then(coupon => {
      res.send(coupon);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving coupon details."
      });
    });
};

exports.findByStatus = (req, res) => {
  Coupon.find({ Status: req.params.Status, StartDate: req.params.StartDate })
    .then(coupon => {
      res.send(coupon);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving coupon details."
      });
    });
};

exports.CouponValidation = (req, res) => {
  Coupon.find({ CouponCode: req.params.CouponCode })
    .then(coupon => {
      const now = new Date().getTime();
      coupon.forEach(getcoupon => {
        if (now > new Date(getcoupon.StartDate).getTime() && now < new Date(getcoupon.EndDate).getTime()) {
          res.send("Entered coupon is valid");
        } else {
          res.send("Entered coupon is out of date");
        }
      });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving coupon details."
      });
    });
};

exports.update = (req, res) => {
  if (!req.body.CouponCode) {
    return res.status(400).send({
      message: "Offer Name cannot be empty"
    });
  }

  Coupon.findByIdAndUpdate(req.params.couponId, {
    
    CouponCode: req.body.CouponCode,
    StartDate: req.body.StartDate,
    EndDate: req.body.EndDate,
    DiscountPercentage: req.body.DiscountPercentage,
    DiscountAmount: req.body.DiscountAmount,
    TermsAndCondition: req.body.TermsAndCondition,
    OfferPosterOrImage: req.body.OfferPosterOrImage,
    Status: req.body.Status
  }, { new: true })
    .then(coupon => {
      if (!coupon) {
        return res.status(404).send({
          message: "Coupon not found with id " + req.params.couponId
        });
      }
      res.send(coupon);
    })
    .catch(err => {
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: "Coupon not found with id " + req.params.couponId
        });
      }
      return res.status(500).send({
        message: "Error updating Coupon with id " + req.params.couponId
      });
    });
};

exports.delete = (req, res) => {
  Coupon.findByIdAndRemove(req.params.couponId)
    .then(coupon => {
      if (!coupon) {
        return res.status(404).send({
          message: "Coupon not found with id " + req.params.couponId
        });
      }
      res.send({ message: "Coupon deleted successfully!" });
    })
    .catch(err => {
      if (err.kind === 'ObjectId' || err.name === 'NotFound') {
        return res.status(404).send({
          message: "Coupon not found with id " + req.params.couponId
        });
      }
      return res.status(500).send({
        message: "Could not delete coupon with id " + req.params.couponId
      });
    });
};
