using Microsoft.AspNetCore.Mvc;

namespace Pharmacy.API.Controllers.BFF
{
    public class DashboardBffController : Controller
    {
        private readonly IDashboardRepository _dashboardRepository;

        public DashboardBffController(IDashboardRepository dashboardRepository)
        {
            _dashboardRepository = dashboardRepository;
        }

        [HttpGet("bff-dashboard")]
        public async Task<IActionResult> GetDashboardSummary()
        {
            var stats = await _dashboardRepository.GetStatsAsync();
            var lowStock = await _dashboardRepository.GetLowStockAsync(10);
            var recentSales = await _dashboardRepository.GetRecentSalesAsync(5);

            return Ok(new
            {
                Stats = stats,
                LowStock = lowStock,
                RecentSales = recentSales
            });
        }
    }
}
