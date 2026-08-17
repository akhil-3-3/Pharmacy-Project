using Pharmacy.Domain.Entities;
using PharmacyDomain.Entities;

namespace Pharmacy.Application.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email);
        Task<IList<string>> GetUserRolesAsync(int userId);
        Task<bool> EmailExistsAsync(string email);   
        Task<int> RegisterAsync(string email, string hashedPassword);
        Task AssignRoleAsync(int userId, string roleName);

        Task SaveRefreshTokenAsync(int userId, string token, DateTime expiresAt);
        Task<RefreshToken?> GetRefreshTokenAsync(string token);
        Task RevokeRefreshTokenAsync(string token);
        Task<User?> GetByIdAsync(int id);
        Task<int> RegisterGoogleUserAsync(string email);
    }
}
