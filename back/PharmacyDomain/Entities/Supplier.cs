public class Supplier
{
    public short SupplierId { get; set; }
    public string SupplierName { get; set; }
    public string SupplierAddress { get; set; }
    public string Phone { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class SupplierDTO
{
    public short SupplierId { get; set; }
    public string SupplierName { get; set; }
}