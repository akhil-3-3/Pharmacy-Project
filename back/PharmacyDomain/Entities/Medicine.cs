public class Medicine
{
    public short MedicineId { get; set; }
    public byte CategoryId { get; set; }
    public short SupplierId { get; set; }
    public string MedicineName { get; set; }
    public short MedicineTypeId { get; set; }
    public string TypeName { get; set; } = String.Empty;
    public decimal Price { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int Quantity { get; set; }
    public string CategoryName { get; set; } = String.Empty;
    public string SupplierName { get; set; } = String.Empty;
}

public class MedicineTypeDTO
{
    public short MedicineTypeId { get; set; }
    public string TypeName { get; set; }
}