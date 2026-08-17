using Dapper;
using Pharmacy.Application.Interfaces;
using Pharmacy.Domain.Entities;
using System.Data;

namespace Pharmacy.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly IDbConnection _db;
        public UserRepository(IDbConnection db) => _db = db;
        public async Task<User?> GetByEmailAsync(string email)
        {
            const string sql = "SELECT Id, Email, Password FROM Users WHERE Email = @Email";
            return await _db.QuerySingleOrDefaultAsync<User>(sql, new { Email = email });
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            const string sql = "SELECT COUNT(1) FROM Users WHERE Email = @Email";
            var count = await _db.ExecuteScalarAsync<int>(sql, new { Email = email });
            return count > 0;
        }

        public async Task<int> RegisterAsync(string email, string hashedPassword)
        {
            const string sql = "INSERT INTO Users (Email, Password) OUTPUT INSERTED.Id VALUES (@Email, @Password)";
            return await _db.ExecuteScalarAsync<int>(sql, new { Email = email, Password = hashedPassword });
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            const string sql = "SELECT Id, Email, Password FROM Users WHERE Id = @Id";
            return await _db.QuerySingleOrDefaultAsync<User>(sql, new { Id = id });
        }

        public async Task<IList<string>> GetUserRolesAsync(int userId)
        {
            const string sql = "SELECT r.Name FROM Roles r INNER JOIN UserRoles ur ON ur.RoleId = r.Id WHERE ur.UserId = @UserId";
            var roles = await _db.QueryAsync<string>(sql, new { UserId = userId }); // Returns IEnumerable list
            return [.. roles];
        }

        public async Task AssignRoleAsync(int userId, string roleName)
        {
            const string sql = "INSERT INTO UserRoles (UserId, RoleId) SELECT @UserId, Id FROM Roles WHERE Name = @RoleName";
            // Only for 1 role
            await _db.ExecuteAsync(sql, new { UserId = userId, RoleName = roleName });
        }

        public async Task<RefreshToken?> GetRefreshTokenAsync(string token)
        {
            const string sql = "SELECT Id, UserId, Token, ExpiresAt, IsRevoked, CreatedAt FROM RefreshTokens WHERE Token = @Token";
            return await _db.QuerySingleOrDefaultAsync<RefreshToken>(sql, new { Token = token });
        }

        public async Task SaveRefreshTokenAsync(int userId, string token, DateTime expiresAt)
        {
            const string sql = "INSERT INTO RefreshTokens (UserId, Token, ExpiresAt) VALUES (@UserId, @Token, @ExpiresAt)";
            await _db.ExecuteAsync(sql, new { UserId = userId, Token = token, ExpiresAt = expiresAt });
        }

        public async Task RevokeRefreshTokenAsync(string token)
        {
            const string sql = "UPDATE RefreshTokens SET IsRevoked = 1 WHERE Token = @Token";
            await _db.ExecuteAsync(sql, new { Token = token });
        }
        
        public async Task<int> RegisterGoogleUserAsync(string email)
        {
            string dummy = "123";
            const string sql = @"INSERT INTO Users (Email, Password) OUTPUT INSERTED.Id VALUES (@Email, @Dummy);";

            return await _db.ExecuteScalarAsync<int>(sql, new
            {
                Email = email,
                @Dummy = dummy
            });
        }
    }
}
