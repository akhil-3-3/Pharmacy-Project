using Dapper;
using System.Data;

public class StockRepository : IStockRepository
{
    private readonly IDbConnection _connection;

    public StockRepository(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task<IEnumerable<Stock>> GetAllAsync()
    {
        var query = @"
            SELECT s.*, m.MedicineName 
            FROM Stock s
            INNER JOIN Medicine m ON s.MedicineId = m.MedicineId
            ORDER BY s.Quantity ASC";

        return await _connection.QueryAsync<Stock>(query);
    }

    public async Task<Stock> GetByMedicineIdAsync(short medicineId)
    {
        var query = @"
            SELECT s.*, m.MedicineName 
            FROM Stock s
            INNER JOIN Medicine m ON s.MedicineId = m.MedicineId
            WHERE s.MedicineId = @MedicineId";

        return await _connection.QuerySingleOrDefaultAsync<Stock>(query, new { MedicineId = medicineId });
    }

    public async Task<bool> UpdateStockAsync(short medicineId, int quantity)
    {
        var query = @"
            UPDATE Stock 
            SET Quantity = Quantity + @Quantity,
                UpdatedAt = GETDATE()
            WHERE MedicineId = @MedicineId";

        var affectedRows = await _connection.ExecuteAsync(query, new { MedicineId = medicineId, Quantity = quantity });
        return affectedRows > 0;
    }

    public async Task AddPurchaseAsync(PurchaseRequest request)
    {
        var table = new DataTable();

        table.Columns.Add("MedicineId", typeof(int));
        table.Columns.Add("Quantity", typeof(int));
        table.Columns.Add("UnitPrice", typeof(decimal));

        foreach (var item in request.Items)
        {
            table.Rows.Add(
                item.MedicineId,
                item.Quantity,
                item.UnitPrice
            );
        }

        var parameters = new DynamicParameters();   

        parameters.Add("@SupplierId", request.SupplierId);

        parameters.Add(
            "@Items",
            table.AsTableValuedParameter("dbo.PurchaseItemListType")
        );

        await _connection.ExecuteAsync(
            "dbo.AddPurchaseWithStock",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }
}