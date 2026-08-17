public interface ISaleRepository
{
    Task<IEnumerable<Sale>> GetAllAsync();
    Task<Sale> GetByIdAsync(int id);
    Task<int> CreateSaleAsync(SaleRequest saleRequest);
    Task<IEnumerable<SalesDetail>> GetSaleDetailsAsync(int saleId);
    Task<decimal> GetTotalRevenueAsync();
    Task<int> GetTodaySalesCountAsync();
    Task<IEnumerable<SaleDetailResponse>> GetSalesByCustomerIdAsync(int customerId);
}