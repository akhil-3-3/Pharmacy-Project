public class Purchase
{
    public int PurchaseId { get; set; }
    public short SupplierId { get; set; }
    public string SupplierName { get; set; }

    public DateTime PurchaseDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public decimal TotalAmount { get; set; }
}