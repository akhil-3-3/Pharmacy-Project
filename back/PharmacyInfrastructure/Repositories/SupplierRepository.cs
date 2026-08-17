using Dapper;
using System.Data;

public class SupplierRepository : ISupplierRepository
{
    private readonly IDbConnection _connection;

    public SupplierRepository(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task<IEnumerable<Supplier>> GetAllAsync()
    {
        var query = "SELECT * FROM Supplier ORDER BY SupplierId DESC";
        return await _connection.QueryAsync<Supplier>(query);
    }

    public async Task<Supplier> GetByIdAsync(short id)
    {
        var query = "SELECT * FROM Supplier WHERE SupplierId = @Id";
        return await _connection.QuerySingleOrDefaultAsync<Supplier>(query, new { Id = id });
    }

    public async Task<short> CreateAsync(Supplier supplier)
    {
        var query = @"
            INSERT INTO Supplier (SupplierName, SupplierAddress, Phone, CreatedAt)
            VALUES (@SupplierName, @SupplierAddress, @Phone, GETDATE());
            SELECT CAST(SCOPE_IDENTITY() AS SMALLINT);";

        return await _connection.QuerySingleAsync<short>(query, supplier);
    }

    public async Task<bool> UpdateAsync(Supplier supplier)
    {
        var query = @"
            UPDATE Supplier 
            SET SupplierName = @SupplierName, 
                SupplierAddress = @SupplierAddress, 
                Phone = @Phone,
                UpdatedAt = GETDATE()
            WHERE SupplierId = @SupplierId";

        var affectedRows = await _connection.ExecuteAsync(query, supplier);
        return affectedRows > 0;
    }

    public async Task<bool> DeleteAsync(short id)
    {
        var query = "DELETE FROM Supplier WHERE SupplierId = @Id";
        var affectedRows = await _connection.ExecuteAsync(query, new { Id = id });
        return affectedRows > 0;
    }
}