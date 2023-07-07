const { authSchema } = require('../validator/validate');

const Coupon = require('../databases/couponSchema');

exports.create = (req, res) => {
  authSchema
    .validateAsync(req.body)
    .then(result => {
      return Coupon.findById(req.body.CouponCode);
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

        return new Promise((resolve, reject) => {
          coupon.save((err, savedCoupon) => {
            if (err) {
              reject(err);
            } else {
              resolve(savedCoupon);
            }
          });
        });
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
exports.findAll = (res) => {
  Coupon.find({}).sort({_id:-1})
  .then(coupon => {
    return new Promise((resolve, reject) => {
      if(coupon){
        resolve(coupon);
        res.send(coupon)
      }
      else{
        reject("no data");
      }

    });
  });
}
    



exports.findByStatus = (res) => {
  
    Coupon.find({ Status: req.params.Status, StartDate: req.params.StartDate })
      .then(coupon => {
        return new Promise((resolve, reject) => {
          if(coupon){
            resolve(coupon);
            res.send(coupon);
          }
          else{
            reject(err.message || "Some error occurred while retrieving coupon details.");
          }
        
      })
      .catch(err => {
        res.send(err.message || "Some error occurred while retrieving coupon details.");
      });
  });
  
};

exports.CouponValidation = (res) => {
  
    Coupon.find({ CouponCode: req.params.CouponCode })
      .then(coupon => {
        return new Promise((resolve, reject) => {
        const now = new Date().getTime();
        coupon.forEach(getcoupon => {
          if (now > new Date(getcoupon.StartDate).getTime() && now < new Date(getcoupon.EndDate).getTime()) {
            console.log("entered coupon is valid");
            res.send("entered coupon is valid");
            resolve.status(200)("Entered coupon is valid");
            res.send("Entered coupon is valid");
          } else {
            reject("Entered coupon is out of date");
            res.send("Entered coupon is out of data");
          }
        });
      })
      .catch(err => {
        res.send(err.message || "Some error occurred while retrieving coupon details.");
      });
  });
};

exports.update = (res) => {
  
    if (!req.body.CouponCode) {
      res.send({ message: "Offer Name cannot be empty" });
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
        return new Promise((resolve, reject) => {
        if (!coupon) {
          reject({ message: "Coupon not found with id " + req.params.couponId });
          res.send("coupon not found with this id");
        }
        resolve(coupon);
        res.send(coupon);
      })
      .catch(err => {
        if (err.kind === 'ObjectId') {
          res.send({ message: "Coupon not found with id " + req.params.couponId });
        } else {
          res.send({ message: "Error updating Coupon with id " + req.params.couponId });
        }
      });
  });
};

exports.delete = (res) => {
  
    Coupon.findByIdAndRemove(req.params.couponId)
      .then(coupon => {
        return new Promise((resolve, reject) => {
        if (!coupon) {
          reject({ message: "Coupon not found with id " + req.params.couponId });
          res.send("coupon not found");
        }
        resolve({ message: "Coupon deleted successfully!" });
        res.send("coupon deleted succesfully");
      })
      .catch(err => {
        if (err.kind === 'ObjectId' || err.name === 'NotFound') {
          res.send({ message: "Coupon not found with id " + req.params.couponId });
        } else {
          res.send({ message: "Could not delete coupon with id " + req.params.couponId });
        }
      });
  });
};
