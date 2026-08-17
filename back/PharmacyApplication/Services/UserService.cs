using Pharmacy.Application.Interfaces;
using Pharmacy.Domain.Entities;
using PharmacyDomain.Entities;

namespace Pharmacy.Application.Services
{
    public class UserService
    {
        private readonly IUserRepository _repository;

        public UserService(IUserRepository repository)
        {
            _repository = repository;
        }

        public async Task AssignRole(int userId, string roleName)
        {
            await _repository.AssignRoleAsync(userId, roleName);
        }
        
        public async Task<int> RegisterGoogleUser(string email)
        {
            return await _repository.RegisterGoogleUserAsync(email);
        }
        

        public async Task<bool> EmailExists(string email)
        {
            return await _repository.EmailExistsAsync(email);
        }

        public async Task<User?> GetByEmail(string email)
        {
            return await _repository.GetByEmailAsync(email);
        }
        public async Task<IList<string>> GetUserRoles(int userId)
        {
            return await _repository.GetUserRolesAsync(userId);
        }
        
        public async Task<int> Register(string email, string hashedPassword)
        {
            return await _repository.RegisterAsync(email, hashedPassword);
        }
        public async Task<RefreshToken?> GetRefreshToken(string token)
        {
            return await _repository.GetRefreshTokenAsync(token);
        }

        public async Task RevokeRefreshToken(string token)
        {
            await _repository.RevokeRefreshTokenAsync(token);
        }
        public async Task<User?> GetById(int id)
        {
            return await _repository.GetByIdAsync(id);
        }
        public async Task SaveRefreshToken(int userId, string token, DateTime expiresAt)
        {
            await _repository.SaveRefreshTokenAsync(userId, token, expiresAt);
        }
    }
}
