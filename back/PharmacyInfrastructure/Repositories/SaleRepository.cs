using Dapper;
using System.Data;

public class SaleRepository : ISaleRepository
{
    private readonly IDbConnection _connection;

    public SaleRepository(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task<IEnumerable<Sale>> GetAllAsync()
    {
        var query = @"
            SELECT s.*, c.CustomerName,
                   (SELECT SUM(sd.Quantity * m.Price) 
                    FROM SalesDetail sd 
                    INNER JOIN Medicine m ON sd.MedicineId = m.MedicineId 
                    WHERE sd.SaleId = s.SaleId) as TotalAmount
            FROM Sale s
            LEFT JOIN Customer c ON s.CustomerId = c.CustomerId
            ORDER BY s.SaleDate DESC";

        return await _connection.QueryAsync<Sale>(query);
    }

    public async Task<Sale> GetByIdAsync(int id)
    {
        var query = @"
            SELECT s.*, c.CustomerName,
                   (SELECT SUM(sd.Quantity * m.Price)
                    FROM SalesDetail sd 
                    INNER JOIN Medicine m ON sd.MedicineId = m.MedicineId 
                    WHERE sd.SaleId = s.SaleId) as TotalAmount
            FROM Sale s
            LEFT JOIN Customer c ON s.CustomerId = c.CustomerId
            WHERE s.SaleId = @Id";

        return await _connection.QuerySingleOrDefaultAsync<Sale>(query, new { Id = id });
    }

    public async Task<int> CreateSaleAsync(SaleRequest request)
    {
        var table = new DataTable();
        table.Columns.Add("MedicineId", typeof(int));
        table.Columns.Add("Quantity", typeof(int));

        foreach (var item in request.Items)
        {
            table.Rows.Add(item.MedicineId, item.Quantity);
        }

        var parameters = new DynamicParameters();
        parameters.Add("@CustomerId", request.CustomerId);
        parameters.Add(
            "@Items",
            table.AsTableValuedParameter("SaleItemListType")
        );
        
        var saleId = await _connection.ExecuteScalarAsync<int>(
            "dbo.CreateSale",
            parameters,
            commandType: CommandType.StoredProcedure
        );

        return saleId;
    }

    //public async Task<int> CreateSaleAsync(SaleRequest saleRequest)
    //{
    //    using var transaction = _connection.BeginTransaction();

    //    try
    //    {
    //        var saleQuery = @"
    //            INSERT INTO Sale (CustomerId, SaleDate, CreatedAt)
    //            VALUES (@CustomerId, GETDATE(), GETDATE());
    //            SELECT CAST(SCOPE_IDENTITY() AS INT);";

    //        var saleId = await _connection.QuerySingleAsync<int>(saleQuery,
    //            new { saleRequest.CustomerId }, transaction);

    //        foreach (var item in saleRequest.Items)
    //        {
    //            var detailQuery = @"
    //                INSERT INTO SalesDetail (SaleId, MedicineId, Quantity, CreatedAt)
    //                VALUES (@SaleId, @MedicineId, @Quantity, GETDATE())";

    //            await _connection.ExecuteAsync(detailQuery, new
    //            {
    //                SaleId = saleId,
    //                item.MedicineId,
    //                item.Quantity
    //            }, transaction);

    //            var stockQuery = @"
    //                UPDATE Stock 
    //                SET Quantity = Quantity - @Quantity,
    //                    UpdatedAt = GETDATE()
    //                WHERE MedicineId = @MedicineId";

    //            await _connection.ExecuteAsync(stockQuery, new
    //            {
    //                item.Quantity,
    //                item.MedicineId
    //            }, transaction);
    //        }

    //        transaction.Commit();
    //        return saleId;
    //    }
    //    catch
    //    {
    //        transaction.Rollback();
    //        throw;
    //    }
    //}

    public async Task<IEnumerable<SalesDetail>> GetSaleDetailsAsync(int saleId)
    {
        var query = @"
            SELECT sd.*, m.MedicineName, m.Price as UnitPrice
            FROM SalesDetail sd
            INNER JOIN Medicine m ON sd.MedicineId = m.MedicineId
            WHERE sd.SaleId = @SaleId";

        return await _connection.QueryAsync<SalesDetail>(query, new { SaleId = saleId });
    }

    public async Task<decimal> GetTotalRevenueAsync()
    {
        var query = @"
            SELECT ISNULL(SUM(sd.Quantity * m.Price), 0)
            FROM SalesDetail sd
            INNER JOIN Medicine m ON sd.MedicineId = m.MedicineId";

        return await _connection.QuerySingleAsync<decimal>(query);
    }

    public async Task<int> GetTodaySalesCountAsync()
    {
        var query = @"
            SELECT COUNT(*)
            FROM Sale
            WHERE CAST(SaleDate AS DATE) = CAST(GETDATE() AS DATE)";

        return await _connection.QuerySingleAsync<int>(query);
    }

    public async Task<IEnumerable<SaleDetailResponse>> GetSalesByCustomerIdAsync(int customerId)
    {
        var query = @"
        SELECT 
            s.SaleId,
            m.MedicineName,
            s.SaleDate,
            sd.Quantity,
            m.Price AS UnitPrice
        FROM Sale s
        INNER JOIN SalesDetail sd 
            ON s.SaleId = sd.SaleId
        INNER JOIN Medicine m 
            ON sd.MedicineId = m.MedicineId
        WHERE s.CustomerId = @CustomerId";

        return await _connection.QueryAsync<SaleDetailResponse>(
            query,
            new { CustomerId = customerId }
        );
    }
}