public class PurchaseRequest
{
    public short SupplierId { get; set; }
    public List<PurchaseItemRequest> Items { get; set; }
}

public class PurchaseItemRequest
{
    public int MedicineId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class PurchaseDetailResponse
{
    public int PurchaseDetailId { get; set; }
    public int PurchaseId { get; set; }

    public int MedicineId { get; set; }
    public string MedicineName { get; set; }

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }

    public decimal TotalPrice { get; set; }

    // optional (useful in supplier-wise listing)
    public DateTime? PurchaseDate { get; set; }
}