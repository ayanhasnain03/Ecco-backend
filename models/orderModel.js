import mongoose from 'mongoose';
const { ObjectId } = mongoose.Schema.Types;

// Changed userId to ObjectId
const schema = new mongoose.Schema(
  {
    shippingInfo: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      pinCode: {
        type: Number,
        required: true,
      },
    },
    user: {
      userId: {
        type: ObjectId,
        ref: "User",
        required: true, // Should be ObjectId if referencing User
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      avatar: {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    },
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    shippingCharges: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered"],
      default: "Processing",
    },
    orderItems: [
      {
        productId: {
          type: ObjectId,
          ref: "Product",
          required: [true, "Product ID is required"], // Use ObjectId for Product reference
        },
        name: {
          type: String,
          required: true,
        },
        image: {
          public_id: {
            type: String,
            required: true,
          },
          url: {
            type: String,
            required: true,
          },
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    
    ],
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", schema);
export default Order;
