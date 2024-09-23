using Nexus_webapi.Models;

namespace Nexus_webapi.Services
{
    public interface IAuthService
    {
        Task<string> GenerateTokenAsync(Employees employee);
    }
}