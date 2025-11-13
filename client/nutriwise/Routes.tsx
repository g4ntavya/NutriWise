import React from "react";
import { Routes, Route } from "react-router-dom";
import NutriIndex from "./pages/Index";
import Budget from "./pages/Budget";
import MealPlan from "./pages/MealPlan";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const NutriwiseRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<NutriIndex />} />
      <Route path="budget" element={<Budget />} />
      <Route path="meal-plan" element={<MealPlan />} />
      <Route path="profile" element={<Profile />} />
      <Route path="about" element={<About />} />
      <Route path="pricing" element={<Pricing />} />
      <Route path="contact" element={<Contact />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default NutriwiseRoutes;
