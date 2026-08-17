use db_pharmacy2;

-- Customer Table
CREATE TABLE Customer (
    CustomerId INT IDENTITY(1,1) PRIMARY KEY,
    CustomerName NVARCHAR(255) NOT NULL,
    CustomerAddress NVARCHAR(500),
    Phone NVARCHAR(50),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Medicine Table
CREATE TABLE Medicine (
    MedicineId INT IDENTITY(1,1) PRIMARY KEY,
    CategoryId INT NOT NULL,
    SupplierId INT NOT NULL,
    MedicineTypeId INT NOT NULL,
    MedicineName NVARCHAR(255) NOT NULL,
    Price DECIMAL(18,2) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Category Table
CREATE TABLE Category (
    CategoryId INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(255) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Supplier Table
CREATE TABLE Supplier (
    SupplierId INT IDENTITY(1,1) PRIMARY KEY,
    SupplierName NVARCHAR(255) NOT NULL,
    SupplierAddress NVARCHAR(500),
    Phone NVARCHAR(50),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- MedicineType Table
CREATE TABLE MedicineType (
    MedicineTypeId INT IDENTITY(1,1) PRIMARY KEY,
    TypeName NVARCHAR(255) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Stock Table
CREATE TABLE Stock (
    StockId INT IDENTITY(1,1) PRIMARY KEY,
    MedicineId INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Sale Table
CREATE TABLE Sale (
    SaleId INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId INT NOT NULL,
    SaleDate DATETIME DEFAULT GETDATE(),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- SalesDetail Table
CREATE TABLE SalesDetail (
    SalesDetailId INT IDENTITY(1,1) PRIMARY KEY,
    SaleId INT NOT NULL,
    MedicineId INT NOT NULL,
    Quantity INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Purchase Table
CREATE TABLE Purchase (
    PurchaseId INT IDENTITY(1,1) PRIMARY KEY,
    SupplierId INT NOT NULL,
    PurchaseDate DATETIME DEFAULT GETDATE(),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- PurchaseDetail Table
CREATE TABLE PurchaseDetail (
    PurchaseDetailId INT IDENTITY(1,1) PRIMARY KEY,
    PurchaseId INT NOT NULL,
    MedicineId INT NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Users Table (for authentication)
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(255) UNIQUE NOT NULL,
    Password NVARCHAR(255) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Roles Table
CREATE TABLE Roles (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) UNIQUE NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- UserRoles Table
CREATE TABLE UserRoles (
    UserRoleId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    RoleId INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- RefreshTokens Table
CREATE TABLE RefreshTokens (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Token NVARCHAR(500) UNIQUE NOT NULL,
    ExpiresAt DATETIME NOT NULL,
    IsRevoked BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Add Foreign Key Constraints
ALTER TABLE Medicine ADD CONSTRAINT FK_Medicine_Category 
    FOREIGN KEY (CategoryId) REFERENCES Category(CategoryId);

ALTER TABLE Medicine ADD CONSTRAINT FK_Medicine_Supplier 
    FOREIGN KEY (SupplierId) REFERENCES Supplier(SupplierId);

ALTER TABLE Medicine ADD CONSTRAINT FK_Medicine_MedicineType 
    FOREIGN KEY (MedicineTypeId) REFERENCES MedicineType(MedicineTypeId);

ALTER TABLE Stock ADD CONSTRAINT FK_Stock_Medicine 
    FOREIGN KEY (MedicineId) REFERENCES Medicine(MedicineId);

ALTER TABLE Sale ADD CONSTRAINT FK_Sale_Customer 
    FOREIGN KEY (CustomerId) REFERENCES Customer(CustomerId);

ALTER TABLE SalesDetail ADD CONSTRAINT FK_SalesDetail_Sale 
    FOREIGN KEY (SaleId) REFERENCES Sale(SaleId);

ALTER TABLE SalesDetail ADD CONSTRAINT FK_SalesDetail_Medicine 
    FOREIGN KEY (MedicineId) REFERENCES Medicine(MedicineId);

ALTER TABLE Purchase ADD CONSTRAINT FK_Purchase_Supplier 
    FOREIGN KEY (SupplierId) REFERENCES Supplier(SupplierId);

ALTER TABLE PurchaseDetail ADD CONSTRAINT FK_PurchaseDetail_Purchase 
    FOREIGN KEY (PurchaseId) REFERENCES Purchase(PurchaseId);

ALTER TABLE PurchaseDetail ADD CONSTRAINT FK_PurchaseDetail_Medicine 
    FOREIGN KEY (MedicineId) REFERENCES Medicine(MedicineId);

ALTER TABLE UserRoles ADD CONSTRAINT FK_UserRoles_User 
    FOREIGN KEY (UserId) REFERENCES Users(Id);

ALTER TABLE UserRoles ADD CONSTRAINT FK_UserRoles_Role 
    FOREIGN KEY (RoleId) REFERENCES Roles(Id);

ALTER TABLE RefreshTokens ADD CONSTRAINT FK_RefreshTokens_User 
    FOREIGN KEY (UserId) REFERENCES Users(Id);

    select * from users;