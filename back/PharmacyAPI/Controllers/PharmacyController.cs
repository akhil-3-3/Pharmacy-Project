using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmacyApplication.Services;

namespace PharmacyAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize(Roles = "Admin,Pharmacist")]
    [Authorize]
    public class PharmacyController : Controller
    {
        private readonly PharmacyService _pharmacyService;

        public PharmacyController(PharmacyService pharmacyService)
        {
            _pharmacyService = pharmacyService;
        }

        [Authorize]
        [HttpGet("customer/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var customer = await _pharmacyService.GetCustomer(id);

                if (customer == null)
                    return NotFound("Customer not found");

                return Ok(customer);
            }
             catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
