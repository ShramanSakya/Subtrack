import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Subscription Name is required"],
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  price: {
    type: Number,
    required: [true, "Subscription Price is required"],
    min: [0, "Price must be greater than or equal to 0"],
  },
  currency: {
    type: String,
    enum: ["USD", "EUR", "GBP", "NRS"],
    default: "NRS",
  },
  frequency: {
    type: String,
    enum: ["daily", "weekly", "monthly", "yearly"],
    default: "monthly",
  },
  category: {
    type: String,
    enum: [
      "gym",
      "entertainment",
      "productivity",
      "education",
      "health",
      "other",
    ],
    default: "other",
    required: [true, "Subscription Category is required"],
  },
  paymentMethod: {
    type: String,
    required: [true, "Payment Method is required"],
    trim: true,
  },
  status: {
    type: String,
    enum: ["active", "canceled", "expired"],
    default: "active",
  },
  startDate: {
    type: Date,
    required: true,
    validate: {
      validator: (value) => value <= new Date(),
      message: "Start date must be today or a future date",
    },
    RenewalDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "Renewal date must be today or a future date",
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  timestamps: true,
});

//auto calculate renewal date based on frequency and start date
subscriptionSchema.pre("save", function (next) {
  if (!this.renewalDate) {
    const renewalPeriods = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      yearly: 365,
    };

    //Jan 1st
    //Monthly
    //30 days
    //Jan 31st

    this.renewalDate = new Date(this.startDate);
    this.renewalDate.setDate(
      this.renewalDate.getDate() + renewalPeriods[this.frequency],
    );
  }

  //Auto-update the status if renewal date has passed
  if (this.renewalDate < new Date()) {
    this.status = "expired";
  }
  next();
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
