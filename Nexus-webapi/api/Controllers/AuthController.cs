using Microsoft.AspNetCore.Mvc;
using Nexus_webapi.Models;
using Nexus_webapi.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Authorization;
using BCrypt.Net;
using System.Security.Claims;

namespace Nexus_webapi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly NexusDbContext _context;
        private readonly IAuthService _authService;
        private readonly JwtSettings _jwtSettings;

        public AuthController(NexusDbContext context, IAuthService authService, IOptions<JwtSettings> jwtSettings)
        {
            _context = context;
            _authService = authService;
            _jwtSettings = jwtSettings.Value;
        }

        /// <summary>
        /// Authenticates a user and returns a JWT token.
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var employee = await _context.Employees
                .FirstOrDefaultAsync(e => e.Name == model.Username || e.Email == model.Email);

            if (employee == null || !BCrypt.Net.BCrypt.Verify(model.Password, employee.PasswordHash))
                return Unauthorized("Invalid credentials.");

            var token = await _authService.GenerateTokenAsync(employee);

            return Ok(new { Token = token });
        }

        /// <summary>
        /// Logs out the user by invalidating the JWT token.
        /// </summary>
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {

            return Ok("Logged out successfully.");
        }

        /// <summary>
        /// Registers a new employee.
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState); 

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(model.Password);

            var newEmployee = new Employees
            {
                Name = model.Name,
                Email = model.Email,
                PasswordHash = passwordHash,
                PinCode = GenerateUniquePinCode() 
            };

            _context.Employees.Add(newEmployee);
            await _context.SaveChangesAsync();

            var token = await _authService.GenerateTokenAsync(newEmployee);

            return Ok(new { Token = token });
        }

        /// <summary>
        /// Gets the authenticated user.
        /// </summary>
        [HttpGet("user")]
        [Authorize]
        public async Task<IActionResult> GetUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _context.Employees.FindAsync(userId);
            return Ok(user);
        }
        private string GenerateUniquePinCode()
        {
            const string digits = "0123456789";
            var rng = new Random();
            string pin;
            do
            {
                pin = new string(Enumerable.Repeat(digits, 4)
                  .Select(s => s[rng.Next(s.Length)]).ToArray());
            } while (_context.Employees.Any(e => e.PinCode == pin));
            return pin;
        }

        public class RegisterDTO
        {
            public string Name { get; set; }
            public string Email { get; set; }
            public string Password { get; set; }
        }
    }
}