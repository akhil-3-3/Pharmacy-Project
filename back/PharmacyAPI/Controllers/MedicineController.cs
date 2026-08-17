using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MedicineController : ControllerBase
{
    private readonly IMedicineRepository _medicineRepository;

    public MedicineController(IMedicineRepository medicineRepository)
    {
        _medicineRepository = medicineRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var medicines = await _medicineRepository.GetAllAsync();
        return Ok(medicines);
    }

    [HttpGet("lowstock")]
    public async Task<IActionResult> GetLowStock([FromQuery] int threshold = 10)
    {
        var medicines = await _medicineRepository.GetLowStockAsync(threshold);
        return Ok(medicines);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(short id)
    {
        var medicine = await _medicineRepository.GetByIdAsync(id);
        if (medicine == null)
            return NotFound();
        return Ok(medicine);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Medicine medicine)
    {
        var id = await _medicineRepository.CreateAsync(medicine);
        return CreatedAtAction(nameof(GetById), new { id }, medicine);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(short id, [FromBody] Medicine medicine)
    {
        //if (id != medicine.MedicineId)
        //    return BadRequest();

        var result = await _medicineRepository.UpdateAsync(medicine);
        if (!result)
            return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(short id)
    {
        var result = await _medicineRepository.DeleteAsync(id);
        if (!result)
            return NotFound();
        return NoContent();
    }

    [HttpGet("medicineTypeList")]
    public async Task<IActionResult> GetMedicineTypeList()
    {
        var medicineTypeList = await _medicineRepository.GetMedicineTypeList();
        return Ok(medicineTypeList);
    }

    [HttpGet("categoryList")]
    public async Task<IActionResult> GetCategoryList()
    {
        var categoryList = await _medicineRepository.GetCategoryList();
        return Ok(categoryList);
    }

    [HttpGet("supplierList")]
    public async Task<IActionResult> GetSupplierList()
    {
        var supplierList = await _medicineRepository.GetSupplierList();
        return Ok(supplierList);
    }


    [HttpGet("admin-only")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAdminTest()
    {
        return Ok("You are an admin");
    }
}