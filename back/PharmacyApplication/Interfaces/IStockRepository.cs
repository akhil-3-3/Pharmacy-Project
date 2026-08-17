public interface IStockRepository
{
    Task<IEnumerable<Stock>> GetAllAsync();
    Task<Stock> GetByMedicineIdAsync(short medicineId);
    Task<bool> UpdateStockAsync(short medicineId, int quantity);
    Task AddPurchaseAsync(PurchaseRequest purchase);
}
