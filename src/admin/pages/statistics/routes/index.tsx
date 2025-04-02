import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import StatisticsOverview from "../StatisticsOverview";
import MonthlyStatistics from "../MonthlyStatistics";
import DailyStatistics from "../DailyStatistics";
import ProductStatistics from "../ProductStatistics";
import CustomerStatistics from "../CustomerStatistics";

const StatisticsRouter = () => {
  return (
    <Routes>
      <Route path="overview" element={<StatisticsOverview />} />
      <Route path="monthly" element={<MonthlyStatistics />} />
      <Route path="daily" element={<DailyStatistics />} />
      <Route path="product" element={<ProductStatistics />} />
      <Route path="customer" element={<CustomerStatistics />} />

      <Route path="" element={<Navigate to="overview" replace />} />
    </Routes>
  );
};

export default StatisticsRouter;
