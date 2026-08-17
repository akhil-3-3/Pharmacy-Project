using PharmacyDomain.Entities;
using PharmacyDomain.Interfaces;

namespace PharmacyApplication.Services
{
    public class PharmacyService
    {
        private readonly IPharmacyRepository _repository;

        public PharmacyService(IPharmacyRepository repository)
        {
            _repository = repository;
        }

        public async Task<Customer?> GetCustomer(int id)
        {
            return await _repository.GetCustomerByIdAsync(id);
        }
    }
}
