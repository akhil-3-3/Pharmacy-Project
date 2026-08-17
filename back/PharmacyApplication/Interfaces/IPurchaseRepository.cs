namespace Pharmacy.Application.Interfaces
{
    public interface IPurchaseRepository
    {
        Task<IEnumerable<Purchase>> GetAllAsync();
        Task<Purchase> GetByIdAsync(int id);
        Task CreatePurchaseAsync(PurchaseRequest request);

        Task<IEnumerable<PurchaseDetailResponse>> GetPurchaseDetailsAsync(int purchaseId);

        Task<decimal> GetTotalPurchaseAmountAsync();
        Task<int> GetTodayPurchaseCountAsync();

        Task<IEnumerable<PurchaseDetailResponse>> GetPurchasesBySupplierIdAsync(int supplierId);
    }
}
