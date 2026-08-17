namespace Pharmacy.Application.Interfaces
{
    public interface ITokenService
    {
        string GenerateToken(string userId, string email, IList<string> roles);
        string GenerateRefreshToken();
    }
}
