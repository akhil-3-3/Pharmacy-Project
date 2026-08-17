public class Category
{
    public byte CategoryId { get; set; }
    public string CategoryName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CategoryDTO
{
    public byte CategoryId { get; set; }
    public string CategoryName { get; set; }
}