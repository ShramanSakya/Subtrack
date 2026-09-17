import aj from "../config/arcjet.js";
import { subscriptionCreationArcjet } from "../config/arcjet.js";

const arcjetMiddleware = async (req, res, next) => {
  try {
    const decision = await aj.protect(req, { requested: 1 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit())
        return res.status(429).json({
          error: "Rate limit exceeded",
        });

      if (decision.reason.isBot())
        return res.status(403).json({
          error: "Bot detected",
        });

      return res.status(403).json({
        error: "Access denied",
      });
    }

    next();
  } catch (error) {
    console.log(`Arcjet Middleware Error: ${error}`);
    next(error);
  }
};

export default arcjetMiddleware;

export const subscriptionCreationRateLimit = async (req, res, next) => {
  try {
    const decision = await subscriptionCreationArcjet.protect(req, {
      userId: req.user._id.toString(),
      requested: 1,
    });

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      return res.status(429).json({
        error: "Too many subscriptions created. Please try again later.",
      });
    }

    next();
  } catch (error) {
    console.log(`Subscription rate limit error: ${error}`);
    next(error);
  }
};
