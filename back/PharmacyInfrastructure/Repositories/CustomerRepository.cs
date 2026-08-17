using Dapper;
using Microsoft.Data.SqlClient;
using PharmacyDomain.Entities;
using System.Data;

public class CustomerRepository : ICustomerRepository
{
    private readonly IDbConnection _connection;

    public CustomerRepository(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task<IEnumerable<Customer>> GetAllAsync()
    {
        var query = "SELECT CustomerId, CustomerName, CustomerAddress, Phone, CreatedAt, UpdatedAt FROM Customer ORDER BY CustomerId DESC";
        return await _connection.QueryAsync<Customer>(query);
    }

    public async Task<Customer?> GetByIdAsync(int id)
    {
        var query = "SELECT CustomerId, CustomerName, CustomerAddress, Phone, CreatedAt, UpdatedAt FROM Customer WHERE CustomerId = @Id";
        return await _connection.QuerySingleOrDefaultAsync<Customer>(query, new { Id = id });
    }

    public async Task<int> CreateAsync(Customer customer)
    {
        var query = @"
            INSERT INTO Customer (CustomerName, CustomerAddress, Phone)
            VALUES (@CustomerName, @CustomerAddress, @Phone);
            SELECT CAST(SCOPE_IDENTITY() AS INT);";

        return await _connection.QuerySingleAsync<int>(query, customer);
    }

    public async Task<bool> UpdateAsync(Customer customer)
    {
        var query = @"
            UPDATE Customer 
            SET CustomerName = @CustomerName, 
                CustomerAddress = @CustomerAddress, 
                Phone = @Phone,
                UpdatedAt = GETDATE()
            WHERE CustomerId = @CustomerId";

        var affectedRows = await _connection.ExecuteAsync(query, customer);
        return affectedRows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        try {
            var query = "DELETE FROM Customer WHERE CustomerId = @Id";
            var affectedRows = await _connection.ExecuteAsync(query, new { Id = id });
            return affectedRows > 0;
        }
        catch (SqlException ex) when (ex.Number == 547)
        {
            // 547 = Foreign key constraint violation
            throw new InvalidOperationException(
                "Cannot delete customer with existing sales records.",
                ex);
        }
    }
}