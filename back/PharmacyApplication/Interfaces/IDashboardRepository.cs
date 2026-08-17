public interface IDashboardRepository
{
    Task<DashboardStats> GetStatsAsync();
    Task<IEnumerable<Stock>> GetLowStockAsync(int threshold);
    Task<IEnumerable<Sale>> GetRecentSalesAsync(int count);
}