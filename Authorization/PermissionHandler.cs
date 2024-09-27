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

        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
        {
            // Retrieve the employee ID from claims
            var employeeIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var token = context.User.FindFirst(JwtRegisteredClaimNames.Jti)?.Value; // Assuming you store JWT ID

            if (employeeIdClaim == null || !int.TryParse(employeeIdClaim, out int employeeId) || string.IsNullOrEmpty(token))
            {
                return;
            }

            // Retrieve the token from the database
            var userToken = await _context.UserTokens
                .FirstOrDefaultAsync(ut => ut.Token == context.User.Identity.Name && ut.EmployeeId == employeeId);

            if (userToken == null)
            {
                return; // Token not found
            }

            // Check if the token has expired
            if (userToken.Expiration <= DateTime.UtcNow)
            {
                // Remove the expired token
                _context.UserTokens.Remove(userToken);
                await _context.SaveChangesAsync();
                return;
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
        }
    }
}