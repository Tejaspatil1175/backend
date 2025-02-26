router.get("/protected", isAuthenticated, protectedRoute);
router.post("/protected", isAuthenticated, protectedRoute); 