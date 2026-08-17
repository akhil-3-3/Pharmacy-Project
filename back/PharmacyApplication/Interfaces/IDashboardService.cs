using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pharmacy.Application.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardStats> GetStatsService();
        Task<IEnumerable<Stock>> GetLowStockService(int threshold);
        Task<IEnumerable<Sale>> GetRecentSalesService(int count);
    }
}
