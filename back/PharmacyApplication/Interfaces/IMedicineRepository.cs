public interface IMedicineRepository
{
    Task<IEnumerable<Medicine>> GetAllAsync();
    Task<Medicine> GetByIdAsync(short id);
    Task<short> CreateAsync(Medicine medicine);
    Task<bool> UpdateAsync(Medicine medicine);
    Task<bool> DeleteAsync(short id);
    Task<IEnumerable<Medicine>> GetLowStockAsync(int threshold = 10);
    Task<IEnumerable<MedicineTypeDTO>> GetMedicineTypeList();
    Task<IEnumerable<CategoryDTO>> GetCategoryList();
    Task<IEnumerable<SupplierDTO>> GetSupplierList();
}