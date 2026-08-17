using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Pharmacy.Domain.Entities;
using PharmacyDomain.Entities;
using PharmacyDomain.Interfaces;
using System.Data;
using System.Net;

namespace PharmacyInfrastructure.Repositories
{
    public class PharmacyRepository : IPharmacyRepository
    {
        private readonly string _connectionString;
        public PharmacyRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        public async Task<Customer?> GetCustomerByIdAsync(int id)
        {
            using var connection = new SqlConnection(_connectionString);

            return await connection.QueryFirstOrDefaultAsync<Customer>(
                    "usp_SelectCustomerById",
                    new { 
                        CustomerId = id
                    },
                    commandType: CommandType.StoredProcedure
                );
        }
    }
}
