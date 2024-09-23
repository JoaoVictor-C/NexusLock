using Microsoft.AspNetCore.Authorization;
using Nexus_webapi.Models;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Nexus_webapi.Authorization
{
    public class PermissionHandler : AuthorizationHandler<PermissionRequirement>
    {
        private readonly NexusDbContext _context;

        public PermissionHandler(NexusDbContext context)
        {
            _context = context;
        }

        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
        {
            // Retrieve the employee ID from claims
            var employeeIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (employeeIdClaim == null || !int.TryParse(employeeIdClaim, out int employeeId))
            {
                return Task.CompletedTask; // User is not authenticated or invalid employee ID
            }

            // Check if the user has the required permission
            var hasPermission = _context.EmployeeRoles
                .Where(er => er.EmployeeId == employeeId)
                .Join(_context.RolePermissions, er => er.RoleId, rp => rp.RoleId, (er, rp) => rp)
                .Join(_context.Permissions, rp => rp.PermissionId, p => p.PermissionId, (rp, p) => p)
                .Any(p => p.PermissionKey == requirement.PermissionKey);

            if (hasPermission)
            {
                context.Succeed(requirement);
            }

            return Task.CompletedTask;
        }
    }
}