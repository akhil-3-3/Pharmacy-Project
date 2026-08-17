using PharmacyDomain.Entities;

namespace PharmacyDomain.Interfaces
{
    public interface IPharmacyRepository
    {
        Task<Customer?> GetCustomerByIdAsync(int id);
    }
}
