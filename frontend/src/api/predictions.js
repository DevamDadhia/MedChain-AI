import api from "./client";

/**
 * Check ML models status
 * Endpoint: GET /predictions/status
 */
export async function getPredictionsStatus() {
  return await api.get("/predictions/status");
}

/**
 * Predict medicine demand using trained ML model
 * Endpoint: POST /predictions/medicine-demand
 */
export async function predictMedicineDemand(payload) {
  return await api.post("/predictions/medicine-demand", {
    sales_year: Number(payload.sales_year),
    sales_month: Number(payload.sales_month),
    demand_lag_1: Number(payload.demand_lag_1),
    demand_lag_2: Number(payload.demand_lag_2),
    demand_lag_3: Number(payload.demand_lag_3),
    demand_rolling_3: Number(payload.demand_rolling_3),
  });
}

/**
 * Predict stockout risk probability using trained ML model
 * Endpoint: POST /predictions/stockout-risk
 */
export async function predictStockoutRisk(payload) {
  return await api.post("/predictions/stockout-risk", {
    current_stock: Number(payload.current_stock),
    min_required: Number(payload.min_required),
    max_capacity: Number(payload.max_capacity),
    unit_cost: Number(payload.unit_cost),
    avg_usage_per_day: Number(payload.avg_usage_per_day),
    restock_lead_time: Number(payload.restock_lead_time),
    stock_coverage_days: Number(payload.stock_coverage_days),
    stock_capacity_ratio: Number(payload.stock_capacity_ratio),
    minimum_stock_ratio: Number(payload.minimum_stock_ratio),
    lead_time_demand: Number(payload.lead_time_demand),
    stock_surplus: Number(payload.stock_surplus),
    estimated_days_to_stockout: Number(payload.estimated_days_to_stockout),
    recommended_reorder_quantity: Number(payload.recommended_reorder_quantity),
  });
}

/**
 * Predict estimated days to stockout using trained ML model
 * Endpoint: POST /predictions/days-to-stockout
 */
export async function predictDaysToStockout(payload) {
  return await api.post("/predictions/days-to-stockout", {
    current_stock: Number(payload.current_stock),
    min_required: Number(payload.min_required),
    max_capacity: Number(payload.max_capacity),
    unit_cost: Number(payload.unit_cost),
    avg_usage_per_day: Number(payload.avg_usage_per_day),
    restock_lead_time: Number(payload.restock_lead_time),
    stock_coverage_days: Number(payload.stock_coverage_days),
    stock_capacity_ratio: Number(payload.stock_capacity_ratio),
    minimum_stock_ratio: Number(payload.minimum_stock_ratio),
    stockout_risk: Number(payload.stockout_risk),
    lead_time_demand: Number(payload.lead_time_demand),
    stock_surplus: Number(payload.stock_surplus),
    recommended_reorder_quantity: Number(payload.recommended_reorder_quantity),
  });
}

/**
 * Predict hospital bed occupancy percentage using trained ML model
 * Endpoint: POST /predictions/bed-occupancy
 */
export async function predictBedOccupancy(payload) {
  return await api.post("/predictions/bed-occupancy", {
    bed_occupancy_lag_1: Number(payload.bed_occupancy_lag_1),
    bed_occupancy_lag_2: Number(payload.bed_occupancy_lag_2),
    bed_occupancy_lag_24: Number(payload.bed_occupancy_lag_24),
    admissions_lag_1: Number(payload.admissions_lag_1),
    admissions_lag_24: Number(payload.admissions_lag_24),
    staff_count: Number(payload.staff_count),
    flu_cases: Number(payload.flu_cases),
    hour: Number(payload.hour),
    day_of_week: Number(payload.day_of_week),
    month: Number(payload.month),
  });
}
