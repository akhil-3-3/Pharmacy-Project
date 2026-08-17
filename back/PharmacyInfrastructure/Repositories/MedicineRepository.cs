using Dapper;
using System.Data;

public class MedicineRepository : IMedicineRepository
{
    private readonly IDbConnection _connection;

    public MedicineRepository(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task<IEnumerable<Medicine>> GetAllAsync()
    {
        var query = @"
            SELECT m.*, c.CategoryName, s.SupplierName, st.Quantity, mt.TypeName
            FROM Medicine m
            INNER JOIN Category c ON m.CategoryId = c.CategoryId
            INNER JOIN Supplier s ON m.SupplierId = s.SupplierId
            INNER JOIN Stock st ON st.MedicineId = m.MedicineId
            INNER JOIN MedicineType mt ON mt.MedicineTypeId = m.MedicineTypeId
            ORDER BY m.MedicineId DESC";

        return await _connection.QueryAsync<Medicine>(query);
    }

    public async Task<Medicine> GetByIdAsync(short id)
    {
        var query = @"
            SELECT m.*, c.CategoryName, s.SupplierName 
            FROM Medicine m
            INNER JOIN Category c ON m.CategoryId = c.CategoryId
            INNER JOIN Supplier s ON m.SupplierId = s.SupplierId
            WHERE m.MedicineId = @Id";

        return await _connection.QuerySingleOrDefaultAsync<Medicine>(query, new { Id = id });
    }

    public async Task<short> CreateAsync(Medicine medicine)
    {
        var query = @"
        DECLARE @MedId SMALLINT;

        INSERT INTO Medicine
            (CategoryId, SupplierId, MedicineName, Price, MedicineTypeId)
        VALUES
            (@CategoryId, @SupplierId, @MedicineName, @Price, @MedicineTypeId);

        SET @MedId = CAST(SCOPE_IDENTITY() AS SMALLINT);

        INSERT INTO Stock (MedicineId, Quantity)
        VALUES (@MedId, 0);

        SELECT @MedId;
    ";

        return await _connection.QuerySingleAsync<short>(query, medicine);
    }

    public async Task<bool> UpdateAsync(Medicine medicine)
    {
        var query = @"
            UPDATE Medicine 
            SET CategoryId = @CategoryId, 
                SupplierId = @SupplierId, 
                MedicineName = @MedicineName,
                MedicineTypeId = @MedicineTypeId,
                Price = @Price,
                UpdatedAt = GETDATE()
            WHERE MedicineId = @MedicineId";

        var affectedRows = await _connection.ExecuteAsync(query, medicine);
        return affectedRows > 0;
    }

    public async Task<bool> DeleteAsync(short id)
    {
        var query = "DELETE FROM Medicine WHERE MedicineId = @Id";
        var affectedRows = await _connection.ExecuteAsync(query, new { Id = id });
        return affectedRows > 0;
    }

    public async Task<IEnumerable<Medicine>> GetLowStockAsync(int threshold = 10)
    {
        var query = @"
            SELECT m.*, c.CategoryName, s.SupplierName, st.Quantity as StockQuantity
            FROM Medicine m
            INNER JOIN Category c ON m.CategoryId = c.CategoryId
            INNER JOIN Supplier s ON m.SupplierId = s.SupplierId
            INNER JOIN Stock st ON m.MedicineId = st.MedicineId
            WHERE st.Quantity < @Threshold
            ORDER BY st.Quantity ASC";

        return await _connection.QueryAsync<Medicine>(query, new { Threshold = threshold });
    }

    public async Task<IEnumerable<MedicineTypeDTO>> GetMedicineTypeList()
    {
        var query = @"select MedicineTypeId, TypeName from MedicineType;";
        return await _connection.QueryAsync<MedicineTypeDTO>(query);
    }

    public async Task<IEnumerable<CategoryDTO>> GetCategoryList()
    {
        var query = @"select CategoryId, CategoryName from Category;";
        return await _connection.QueryAsync<CategoryDTO>(query);
    }
    public async Task<IEnumerable<SupplierDTO>> GetSupplierList()
    {
        var query = @"select SupplierId, SupplierName from Supplier;";
        return await _connection.QueryAsync<SupplierDTO>(query);
    }
}