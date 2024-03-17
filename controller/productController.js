import productModel from "../models/productModel.js"
import fs from 'fs'
import slugify from "slugify";
import categoryModel from "../models/categoryModel.js";
import braintree from "braintree";
import orderModel from "../models/orderModel.js";
import dotenv from 'dotenv'
dotenv.config();
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});
export const createProductController = async (req, res) => {
    try {
      const { name, description, price, category, quantity, shipping } =
        req.fields;
      const { photo } = req.files;
      //alidation
      switch (true) {
        case !name:
          return res.status(500).send({ error: "Name is Required" });
        case !description:
          return res.status(500).send({ error: "Description is Required" });
        case !price:
          return res.status(500).send({ error: "Price is Required" });
        case !category:
          return res.status(500).send({ error: "Category is Required" });
        case !quantity:
          return res.status(500).send({ error: "Quantity is Required" });
        case photo && photo.size > 1000000:
          return res
            .status(500)
            .send({ error: "photo is Required and should be less then 1mb" });
      }
  
      const products = new productModel({ ...req.fields, slug: slugify(name) });
      if (photo) {
        products.photo.data = fs.readFileSync(photo.path);
        products.photo.contentType = photo.type;
      }
      await products.save();
      res.status(201).send({
        success: true,
        message: "Product Created Successfully",
        products,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        error,
        message: "Error in crearing product",
      });
    }
  };
  export const getProductController=async(req,res)=>{
    try{
        const products=await productModel.find({})
        .populate('category')
        .select("-photo").limit(12).sort({createdAt:-1})
        res.status(200).send({
            success:true,
            message:"All products",
            products,
            tottal:products.length
        })
    }catch(error)
    {
        console.log(error)
        res.status(500).send({
            success:false,
            message:"Error in getting products",
            error:error.message
        })
    }
}

export const getSingleProductController=async(req,res)=>{
    try{
        const product=await productModel.findOne({slug:req.params.slug}).select("-photo")
        .populate("category");
        res.status(200).send({
            success:true,
            message:"single product fetched",
            product
        })
    }
    catch(error)
    {
        console.log(error)
        res.status(500).send({
            success:false,
            message:"error occured"
    })
    }
    }
    export const productPhotoController = async (req, res) => {
      try {
          const productId = req.params.pid;
          if (!productId) {
              return res.status(400).send({ success: false, message: "Product ID (pid) is missing" });
          }
  
          const product = await productModel.findById(productId).select("photo");
          if (product && product.photo && product.photo.data) {
              res.set("Content-type", product.photo.contentType);
              return res.status(200).send(product.photo.data);
          } else {
              return res.status(404).send({ success: false, message: "Photo not found" });
          }
      } catch (error) {
          console.log(error);
          res.status(500).send({
              success: false,
              message: "Error while getting photo",
              error,
          });
      }
  };
  
    
    
  export const deleteProductController=async(req,res)=>{
    try{
        await productModel.findByIdAndDelete(req.params.pid).select("-photo");
        res.status(200).send({
            success:true,
            message:"Product deleted Successfully"
        })
    }catch(error)
    {
        console.log(error)
        res.status(500).send({
            success:false,
            message:"Error While deleting ",
            error
        })
    }
  }
  export const updateProductController=async(req,res)=>{
    try {
        const { name, description, price, category, quantity, shipping } =
          req.fields;
        const { photo } = req.files;
        //alidation
        switch (true) {
          case !name:
            return res.status(500).send({ error: "Name is Required" });
          case !description:
            return res.status(500).send({ error: "Description is Required" });
          case !price:
            return res.status(500).send({ error: "Price is Required" });
          case !category:
            return res.status(500).send({ error: "Category is Required" });
          case !quantity:
            return res.status(500).send({ error: "Quantity is Required" });
          case photo && photo.size > 1000000:
            return res
              .status(500)
              .send({ error: "photo is Required and should be less then 1mb" });
        }
    
        const products = await productModel.findByIdAndUpdate(
          req.params.pid,
          { ...req.fields, slug: slugify(name) },
          { new: true }
        );
        if (photo) {
          products.photo.data = fs.readFileSync(photo.path);
          products.photo.contentType = photo.type;
        }
        await products.save();
        res.status(201).send({
          success: true,
          message: "Product Updated Successfully",
          products,
        });
      } catch (error) {
        console.log(error);
        res.status(500).send({
          success: false,
          error,
          message: "Error in Updte product",
        });
      }
  }
  export const productFiltersController=async(req,res)=>{
    try{
      const {checked,radio}=req.body;
      let args={}
      if(checked.length>0)
      args.category=checked
      if(radio.length)
      args.price={$gte:radio[0],$lte:radio[1]}
    const products=await productModel.find(args)
    res.status(200).send({
      success:true,
      products
    })
    }
    catch(error)
    {
      console.log(error)
      res.status>send({
        success:false,
        message:"Error while Filtering Products",
        error
      })
    }
  }
  export const productCountController=async(req,res)=>{
    try{
      const total=await productModel.find({}).estimatedDocumentCount()
      res.status(200).send({
        success:true,
        total,
      })
    }catch(error)
    {
      console.log(error)
      res.status(400).send({
        success:false,
        error,
        message:"Error in product count"
      })
    }
  }
  export const productListController=async(req,res)=>{
    try{
      const perPage=6
      const page=req.params.page?req.params.page:1
      const products=await productModel.find({}).select("-photo").skip((page-1)*perPage).limit(perPage).sort({createdAt:-1})
      return res.status(200).send({
        success:true,
        products,
      })
    }catch(error)
    {
      console.log(error)
      res.status(400).send({
        message:"Error in Product Page",
        error,
        success:false
      })
    }
  }
  export const searchProductController = async (req, res) => {
    try {
        const { keyword } = req.params;
        console.log("Keyword:", keyword); // Log the keyword being searched
        const results = await productModel
            .find({
                $or: [
                    { name: { $regex: keyword, $options: "i" } },
                    { description: { $regex: keyword, $options: "i" } },
                ],
            })
            .select("-photo");
        console.log("Results:", results); // Log the results from the database query
        res.json(results);
    } catch (error) {
        console.error("Error:", error); // Log any errors that occur during the query
        res.status(400).send({
            success: false,
            message: "Error In Search Product API",
            error,
        });
    }
};


  export const relatedProductController=async(req,res)=>{
    try{
      const {pid,cid}=req.params
      const products=await productModel.find({
        category:cid,
        _id:{$ne:pid}
      }).select("-photo").limit(4).populate("category")
      res.status(200).send({
        success:true,
        products,
      })

    }
    catch(error)
    {
      console.log(error)
      res.status(400).send({
        success:false,
        message:"Error while getting products",
        error
      })
    }
  }
  export const productCategoryController=async(req,res)=>{
    try{
      const category=await categoryModel.findOne({slug:req.params.slug})
      const products=await productModel.find({category}).populate('category')
      res.status(200).send({
        success:true,
        category,
        products,
      })
    }catch(error)
    {
      console.log(error)
      res.status(400).send({
        success:false,
        error,
        message:"Error While getting product"
      })
    }
  }
  export const braintreeTokenController=async(req,res)=>{
    try{
      gateway.clientToken.generate({}, function (err, response) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.send(response);
        }
      });
    }catch(error)
    {
      console.log(error)
      res.status(400).send({
        success:false,
        error,
        message:"Error While getting token"
      })
      
    }
  }
  export const braintreePaymentController=async(req,res)=>{
    try {
      const { nonce, cart } = req.body;
      let total = 0;
      cart.map((i) => {
        total += i.price;
      });
      let newTransaction = gateway.transaction.sale(
        {
          amount: total,
          paymentMethodNonce: nonce,
          options: {
            submitForSettlement: true,
          },
        },
        function (error, result) {
          if (result) {
            const order = new orderModel({
              products: cart,
              payment: result,
              buyer: req.user._id,
            }).save();
            res.json({ ok: true });
          } else {
            res.status(500).send(error);
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  };