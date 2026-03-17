const DEMO_EMAIL = "demo@smartchef.test";

const demoGuard = (req, res, next) => {
  if (req.user?.email === DEMO_EMAIL && req.method !== "GET") {
    return res.status(403).json({
      success: false,
      demo: true,
      message:
        "Demo account is for exploration only. Create an account for full access.",
    });
  }
  next();
};

export default demoGuard;
