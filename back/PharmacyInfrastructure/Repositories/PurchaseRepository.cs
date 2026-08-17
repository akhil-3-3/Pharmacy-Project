using Dapper;
using Pharmacy.Application.Interfaces;
using System.Data;

public class PurchaseRepository : IPurchaseRepository
{
    private readonly IDbConnection _connection;

    public PurchaseRepository(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task<IEnumerable<Purchase>> GetAllAsync()
    {
        var query = @"
            SELECT 
                p.PurchaseId,
                p.SupplierId,
                s.SupplierName,
                p.PurchaseDate,
                p.CreatedAt,
                p.UpdatedAt,
                ISNULL(SUM(pd.Quantity * pd.UnitPrice), 0) AS TotalAmount
            FROM Purchase p
            INNER JOIN Supplier s
                ON p.SupplierId = s.SupplierId
            LEFT JOIN PurchaseDetail pd
                ON p.PurchaseId = pd.PurchaseId
            GROUP BY
                p.PurchaseId,
                p.SupplierId,
                s.SupplierName,
                p.PurchaseDate,
                p.CreatedAt,
                p.UpdatedAt
            ORDER BY p.PurchaseDate DESC";

        return await _connection.QueryAsync<Purchase>(query);
    }

    public async Task<Purchase> GetByIdAsync(int id)
    {
        var query = @"
            SELECT 
                p.PurchaseId,
                p.SupplierId,
                s.SupplierName,
                p.PurchaseDate,
                p.CreatedAt,
                p.UpdatedAt,
                ISNULL(SUM(pd.Quantity * pd.UnitPrice), 0) AS TotalAmount
            FROM Purchase p
            INNER JOIN Supplier s
                ON p.SupplierId = s.SupplierId
            LEFT JOIN PurchaseDetail pd
                ON p.PurchaseId = pd.PurchaseId
            WHERE p.PurchaseId = @Id
            GROUP BY
                p.PurchaseId,
                p.SupplierId,
                s.SupplierName,
                p.PurchaseDate,
                p.CreatedAt,
                p.UpdatedAt";

        return await _connection.QuerySingleOrDefaultAsync<Purchase>(
            query,
            new { Id = id }
        );
    }

    public async Task CreatePurchaseAsync(PurchaseRequest request)
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
            table.AsTableValuedParameter("PurchaseItemListType")
        );

        await _connection.ExecuteAsync(
            "dbo.AddPurchaseWithStock",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<IEnumerable<PurchaseDetailResponse>> GetPurchaseDetailsAsync(int purchaseId)
    {
        var query = @"
            SELECT
                pd.PurchaseDetailId,
                pd.PurchaseId,
                pd.MedicineId,
                m.MedicineName,
                pd.Quantity,
                pd.UnitPrice,
                (pd.Quantity * pd.UnitPrice) AS TotalPrice
            FROM PurchaseDetail pd
            INNER JOIN Medicine m
                ON pd.MedicineId = m.MedicineId
            WHERE pd.PurchaseId = @PurchaseId";

        return await _connection.QueryAsync<PurchaseDetailResponse>(
            query,
            new { PurchaseId = purchaseId }
        );
    }

    public async Task<decimal> GetTotalPurchaseAmountAsync()
    {
        var query = @"
            SELECT ISNULL(SUM(Quantity * UnitPrice), 0)
            FROM PurchaseDetail";

        return await _connection.QuerySingleAsync<decimal>(query);
    }

    public async Task<int> GetTodayPurchaseCountAsync()
    {
        var query = @"
            SELECT COUNT(*)
            FROM Purchase
            WHERE CAST(PurchaseDate AS DATE) = CAST(GETDATE() AS DATE)";

        return await _connection.QuerySingleAsync<int>(query);
    }

    public async Task<IEnumerable<PurchaseDetailResponse>> GetPurchasesBySupplierIdAsync(int supplierId)
    {
        var query = @"
            SELECT
                p.PurchaseId,
                p.PurchaseDate,
                m.MedicineName,
                pd.Quantity,
                pd.UnitPrice,
                (pd.Quantity * pd.UnitPrice) AS TotalPrice
            FROM Purchase p
            INNER JOIN PurchaseDetail pd
                ON p.PurchaseId = pd.PurchaseId
            INNER JOIN Medicine m
                ON pd.MedicineId = m.MedicineId
            WHERE p.SupplierId = @SupplierId
            ORDER BY p.PurchaseDate DESC";

        return await _connection.QueryAsync<PurchaseDetailResponse>(
            query,
            new { SupplierId = supplierId }
        );
    }
}