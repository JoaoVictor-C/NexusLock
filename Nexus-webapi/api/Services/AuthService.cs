using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Nexus_webapi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Nexus_webapi.Services
{
    public class AuthService : IAuthService
    {
        private readonly JwtSettings _jwtSettings;
        private readonly NexusDbContext _context;

        public AuthService(IOptions<JwtSettings> jwtSettings, NexusDbContext context)
        {
            _jwtSettings = jwtSettings.Value;
            _context = context;
        }

        public async Task<string> GenerateTokenAsync(Employees employee)
        {
            // Check if the employee already has a valid token
            var existingToken = _context.UserTokens
                .Where(ut => ut.EmployeeId == employee.EmployeeId && ut.Expiration > DateTime.UtcNow)
                .OrderByDescending(ut => ut.Expiration)
                .FirstOrDefault();

            if (existingToken != null)
            {
                // Extend the expiration time of the existing token
                existingToken.Expiration = DateTime.UtcNow.AddMinutes(_jwtSettings.TokenLifetimeMinutes);
                await _context.SaveChangesAsync();
                return existingToken.Token;
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, employee.EmployeeId.ToString()),
                new Claim(ClaimTypes.Name, employee.Name),
                new Claim(ClaimTypes.Email, employee.Email)
                // Add more claims as needed
            };


            // Add permissions as claims
            var permissions = from er in _context.EmployeeRoles
                              join rp in _context.RolePermissions on er.RoleId equals rp.RoleId
                              join p in _context.Permissions on rp.PermissionId equals p.PermissionId
                              where er.EmployeeId == employee.EmployeeId
                              select p.PermissionKey;

            foreach (var permission in permissions.Distinct())
            {
                claims.Add(new Claim("permission", permission));
            }

            var now = DateTime.UtcNow;
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                NotBefore = now,
                Expires = now.AddMinutes(_jwtSettings.TokenLifetimeMinutes),
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
            }; 

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            // Store the token in the database
            var userToken = new UserToken
            {
                EmployeeId = employee.EmployeeId,
                Token = tokenString,
                Expiration = tokenDescriptor.Expires.Value,
                CreatedAt = DateTime.UtcNow
            };
            _context.UserTokens.Add(userToken);
            await _context.SaveChangesAsync();

            return tokenString;
        }
    }
}
