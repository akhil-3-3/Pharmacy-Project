using Dapper;
using System.Data;

public class DashboardRepository : IDashboardRepository
{
    private readonly IDbConnection _connection;

    public DashboardRepository(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task<DashboardStats> GetStatsAsync()
    {
        var query = @"
            SELECT 
                (SELECT COUNT(*) FROM Medicine) AS TotalMedicines,
                (SELECT COUNT(*) FROM Customer) AS TotalCustomers,
                (SELECT COUNT(*) FROM Supplier) AS TotalSuppliers,
                (SELECT COUNT(*) FROM Sale WHERE CAST(SaleDate AS DATE) = CAST(GETDATE() AS DATE)) AS TodaySales,
                (SELECT ISNULL(SUM(sd.Quantity * m.Price), 0) FROM SalesDetail sd INNER JOIN Medicine m ON sd.MedicineId = m.MedicineId) AS TotalRevenue";
        return await _connection.QuerySingleAsync<DashboardStats>(query);
    }

    public async Task<IEnumerable<Stock>> GetLowStockAsync(int threshold = 10)
    {
        var query = @"
            SELECT s.StockId, s.MedicineId, s.Quantity, s.CreatedAt, s.UpdatedAt, m.MedicineName 
            FROM Stock s
            INNER JOIN Medicine m ON s.MedicineId = m.MedicineId
            WHERE s.Quantity < @Threshold
            ORDER BY s.Quantity ASC";

        return await _connection.QueryAsync<Stock>(query, new { Threshold = threshold });
    }

    public async Task<IEnumerable<Sale>> GetRecentSalesAsync(int count = 5)
    {
        var query = @"
            select top (@Count)
                s.SaleId, 
                c.CustomerId, 
                c.CustomerName, 
                s.SaleDate, 
                s.UpdatedAt, 
                sum(sd.Quantity * m.Price) as TotalAmount from Sale s 
            inner join Customer c on c.CustomerId = s.CustomerId 
            inner join SalesDetail sd on sd.SaleId = s.SaleId 
            inner join Medicine m on m.MedicineId = sd.MedicineId 
            group by s.SaleId, c.CustomerId, c.CustomerName, s.SaleDate, s.UpdatedAt 
            order by s.SaleDate desc;
        ";

        return await _connection.QueryAsync<Sale>(query, new { Count = count });
    }
}