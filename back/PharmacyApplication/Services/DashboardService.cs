using Pharmacy.Application.Interfaces;

namespace Pharmacy.Application.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IDashboardRepository _dashboardRepository;
        public DashboardService(IDashboardRepository dashboardRepository)
        {
            _dashboardRepository = dashboardRepository;
        }

        public async Task<DashboardStats> GetStatsService()
        {
            return await _dashboardRepository.GetStatsAsync();
        }

        public async Task<IEnumerable<Stock>> GetLowStockService(int threshold)
        {
            return await _dashboardRepository.GetLowStockAsync(10);
        }

        public async Task<IEnumerable<Sale>> GetRecentSalesService(int count)
        {
            return await _dashboardRepository.GetRecentSalesAsync(5);
        }
    }
}
