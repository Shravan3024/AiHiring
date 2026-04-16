module.exports = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = (req.user?.role || "").toString().toUpperCase();
    const allowed = allowedRoles.map((r) => r.toString().toUpperCase());

    if (!userRole || !allowed.includes(userRole)) {
      console.warn(`Role access denied: user=${req.user?.id} role=${req.user?.role} allowed=${allowedRoles}`);
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
